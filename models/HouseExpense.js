const mongoose = require("mongoose");

const houseExpenseSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: "other",
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HouseExpense", houseExpenseSchema);