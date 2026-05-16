const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ["paid", "pending", "prepared"],
      default: "pending",
    },
  },
  { _id: true } // 👈 ENSURE THIS
);
const subscriptionSchema = new mongoose.Schema(
  {
    name: String,
    amount: Number,
    billing: {
      type: String,
      enum: ["monthly", "yearly"],
    },
    type: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },
    payments: [paymentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);