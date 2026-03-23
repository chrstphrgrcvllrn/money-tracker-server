const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  status: { type: String, default: "Pending" },
});

const monthlyBillsSchema = new mongoose.Schema({
  month: String,
  bills: [billSchema],
});

module.exports = mongoose.model("MonthlyBills", monthlyBillsSchema);