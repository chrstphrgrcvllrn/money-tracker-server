const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      default: () => new Date().toISOString(),
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: "payment", // "payment" | "deduction"
    },
  },
  // { _id: false }
);

const loanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initialAmount: { type: Number, required: true },
  transactions: { type: [transactionSchema], default: [] },
}, { timestamps: true }); // <-- createdAt / updatedAt

module.exports = mongoose.model("Loan", loanSchema);