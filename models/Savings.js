const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    amount: { type: Number, required: true }, // + deposit, - withdrawal
    type: { type: String, default: "transaction" },
  },
  { _id: false }
);

const savingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    initialAmount: { type: Number, required: true },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Savings", savingsSchema);