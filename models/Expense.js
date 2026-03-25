const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);