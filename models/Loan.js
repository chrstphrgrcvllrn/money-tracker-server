const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

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
    // Free-text reminder for this entry (where it went, a reference no., etc.).
    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  // { _id: false }
);

const loanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initialAmount: { type: Number, required: true },
  transactions: { type: [transactionSchema], default: [] },
  archived: { type: Boolean, default: false },
}, { timestamps: true }); // <-- createdAt / updatedAt

loanSchema.plugin(userOwned);

module.exports = mongoose.model("Loan", loanSchema);