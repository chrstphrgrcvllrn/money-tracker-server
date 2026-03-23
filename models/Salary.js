const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    name: String,
    amount: Number,
  },
  { _id: true }
);

const salarySchema = new mongoose.Schema(
  {
    month: String,
    salary: Number,
    expenses: [expenseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);