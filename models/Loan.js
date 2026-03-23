const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    date: String,
    amount: {
      type: Number,
      default: 0,
    },
    type: String,
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    initialAmount: {
      type: Number,
      required: true,
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);