const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const expenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
  },
  { _id: true }
);

const salarySchema = new mongoose.Schema(
  {
    // ✅ match frontend
    date: { type: String, required: true },

    salary: { type: Number, required: true },

    // Added on top of salary to form the month's budget (salary + overtime).
    overtime: { type: Number, default: 0 },

    // ✅ prevent undefined crashes
    expenses: {
      type: [expenseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

salarySchema.plugin(userOwned);

module.exports = mongoose.model("Salary", salarySchema);