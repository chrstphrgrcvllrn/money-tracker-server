const mongoose = require("mongoose");

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

    // ✅ prevent undefined crashes
    expenses: {
      type: [expenseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);