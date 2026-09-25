/**
 * One-time migration to multi-user.
 *
 *   node scripts/migrate-to-multi-user.js --dry-run   # report only, changes nothing
 *   node scripts/migrate-to-multi-user.js             # do it
 *
 * Reads from the environment / .env:
 *   MONGO_URI
 *   MIGRATION_OWNER_USERNAME   e.g. chrstphrvllrn
 *   MIGRATION_OWNER_PASSWORD   only needed if that user doesn't exist yet;
 *                              never hardcoded, never printed
 *
 * What it does:
 *   1. Finds or creates the owner account (an existing account is left exactly
 *      as it is: its password is NOT changed).
 *   2. Sets userId = owner on every document that has no owner, in every
 *      user-owned collection. Documents that already have an owner are never
 *      touched. It does not delete or rewrite anything else.
 *   3. Fixes indexes: drops Water's old unique-on-date index (an index, not
 *      data) and builds the per-user ones.
 *
 * Safe to run repeatedly: a second run finds nothing to update.
 */
const mongoose = require("mongoose");

const NEEDS_OWNER = { $or: [{ userId: { $exists: false } }, { userId: null }] };

// The migration never issues tokens, so if the JWT secrets aren't set yet
// (they're needed by the server, not by this script) use throwaway ones just
// to satisfy config validation.
const ensureConfig = () => {
  const crypto = require("crypto");
  for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]) {
    if (!process.env[key]) process.env[key] = crypto.randomBytes(32).toString("hex");
  }
};

const loadModels = () => ({
  Bills: require("../models/Bill"),
  Calendar: require("../models/Calendar"),
  Expense: require("../models/Expense"),
  HouseExpense: require("../models/HouseExpense"),
  Loan: require("../models/Loan"),
  Note: require("../models/Note"),
  NotebookNote: require("../models/NotebookNote"),
  Salary: require("../models/Salary"),
  Savings: require("../models/Savings"),
  Subscription: require("../models/Subscription"),
  Thought: require("../models/Thoughts"),
  Tracker: require("../models/Tracker"),
  Watch: require("../models/Watch"),
  Water: require("../models/Water"),
});

/**
 * @param {object} options
 * @param {boolean} [options.dryRun]
 * @param {string}  options.ownerUsername
 * @param {string}  [options.ownerPassword]
 * @param {(line: string) => void} [options.log]
 * @returns {Promise<{ owner: string, ownerCreated: boolean, collections: Array<object> }>}
 */
const migrate = async ({ dryRun = false, ownerUsername, ownerPassword, log = console.log }) => {
  ensureConfig();
  const User = require("../models/User");
  const { hashPassword } = require("../utils/password");
  const models = loadModels();

  if (!ownerUsername) throw new Error("MIGRATION_OWNER_USERNAME is required");
  const username = ownerUsername.trim().toLowerCase();

  log(dryRun ? "DRY RUN: nothing will be changed.\n" : "Running migration.\n");

  // ---- 1. owner account ----------------------------------------------------
  let owner = await User.findOne({ username });
  let ownerCreated = false;

  if (owner) {
    log(`Owner "${username}" already exists (id ${owner._id}); leaving the account as is.`);
  } else if (dryRun) {
    log(`Owner "${username}" does not exist; would create it.`);
  } else {
    if (!ownerPassword) {
      throw new Error(
        `User "${username}" doesn't exist yet, so MIGRATION_OWNER_PASSWORD is required to create it.`
      );
    }
    owner = await User.create({ username, passwordHash: await hashPassword(ownerPassword) });
    ownerCreated = true;
    log(`Created owner "${username}" (id ${owner._id}).`);
  }

  // ---- 2. assign ownerless documents --------------------------------------
  const collections = [];
  for (const [label, Model] of Object.entries(models)) {
    const totalBefore = await Model.collection.countDocuments({});
    const ownerless = await Model.collection.countDocuments(NEEDS_OWNER);

    let updated = 0;
    if (!dryRun && ownerless > 0) {
      // timestamps:false so updatedAt isn't bumped (some screens sort by it).
      const result = await Model.updateMany(NEEDS_OWNER, { $set: { userId: owner._id } }, { timestamps: false });
      updated = result.modifiedCount;
    }

    const totalAfter = await Model.collection.countDocuments({});
    if (totalAfter !== totalBefore) {
      // Can't happen with updateMany; if it ever did, stop loudly.
      throw new Error(`${label}: document count changed (${totalBefore} -> ${totalAfter}). Aborting.`);
    }

    const stillOwnerless = await Model.collection.countDocuments(NEEDS_OWNER);
    collections.push({ collection: label, total: totalAfter, ownerless, updated, stillOwnerless });
  }

  // ---- 3. indexes ----------------------------------------------------------
  const indexNotes = [];
  const waterIndexes = await models.Water.collection.indexes().catch(() => []);
  const legacyWater = waterIndexes.find((i) => i.name === "date_1");

  if (legacyWater) {
    if (dryRun) {
      indexNotes.push("would drop Water index date_1 (unique on date alone)");
    } else {
      await models.Water.collection.dropIndex("date_1");
      indexNotes.push("dropped Water index date_1 (unique on date alone)");
    }
  }
  if (!dryRun) {
    await User.createIndexes();
    for (const Model of Object.values(models)) await Model.createIndexes();
    indexNotes.push("ensured per-user indexes (userId, and userId+date unique on Water)");
  } else {
    indexNotes.push("would ensure per-user indexes (userId, and userId+date unique on Water)");
  }

  // ---- report --------------------------------------------------------------
  log("\nCollection        docs   no owner   " + (dryRun ? "would update" : "updated") + "   still no owner");
  for (const c of collections) {
    log(
      `${c.collection.padEnd(16)} ${String(c.total).padStart(5)} ${String(c.ownerless).padStart(10)} ` +
        `${String(dryRun ? c.ownerless : c.updated).padStart(13)} ${String(c.stillOwnerless).padStart(16)}`
    );
  }
  log("");
  indexNotes.forEach((note) => log(`- ${note}`));

  const leftover = collections.filter((c) => !dryRun && c.stillOwnerless > 0);
  if (leftover.length) {
    throw new Error(`Some documents still have no owner: ${leftover.map((c) => c.collection).join(", ")}`);
  }
  log(dryRun ? "\nDry run complete. Re-run without --dry-run to apply." : "\nMigration complete.");

  return { owner: username, ownerCreated, collections };
};

const main = async () => {
  require("dotenv").config({ quiet: true });
  const dryRun = process.argv.includes("--dry-run");

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to database "${mongoose.connection.name}".`);

  try {
    await migrate({
      dryRun,
      ownerUsername: process.env.MIGRATION_OWNER_USERNAME,
      ownerPassword: process.env.MIGRATION_OWNER_PASSWORD,
    });
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`\nMigration failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { migrate };
