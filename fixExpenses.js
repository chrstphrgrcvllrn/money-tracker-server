require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("./models/Expense.js");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Expense.updateMany(
      {
        $or: [
          { category: { $exists: false } },
          { done: { $exists: false } }
        ]
      },
      {
        $set: {
          category: "other",
          done: false
        }
      }
    );

    console.log("✅ Migration completed");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

run();