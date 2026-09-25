const { migrate } = require("./migrate-to-multi-user");

/**
 * Runs the migration once at server start, for hosts where the database can only
 * be reached from inside the platform (e.g. Railway's private network).
 *
 * Controlled entirely by environment variables, off by default:
 *   MIGRATE_ON_BOOT=dry-run   log what would change; change nothing
 *   MIGRATE_ON_BOOT=run       assign every ownerless document to the owner
 *   MIGRATION_OWNER_USERNAME / MIGRATION_OWNER_PASSWORD
 *
 * Safe to leave on for a restart or two (it's idempotent), but remove the
 * variables afterwards, especially the password. Never throws: a failed
 * migration is logged and the server keeps serving.
 */
const runBootMigration = async ({ mode, ownerUsername, ownerPassword, log = console.log }) => {
  if (!mode) return { ran: false };

  log(`[boot migration] MIGRATE_ON_BOOT=${mode}`);
  try {
    const result = await migrate({
      dryRun: mode === "dry-run",
      ownerUsername,
      ownerPassword,
      log: (line) => log(`[boot migration] ${line}`),
    });
    return { ran: true, ...result };
  } catch (error) {
    log(`[boot migration] FAILED, nothing was changed by this step: ${error.message}`);
    return { ran: true, error: error.message };
  }
};

module.exports = { runBootMigration };
