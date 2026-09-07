const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["medical", "dental", "motorcycle", "crypto", "digital", "amilyar"],
    },
    name: { type: String, required: true },
    details: { type: String, default: "" },
    date: { type: String, required: true },
    amount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tracker", trackerSchema);
