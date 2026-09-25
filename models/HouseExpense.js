const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

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
    // Name of who borrowed this money from the house budget ("" = a normal
    // expense). A negative amount on a borrowed entry records a repayment.
    borrowedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

houseExpenseSchema.plugin(userOwned);

module.exports = mongoose.model("HouseExpense", houseExpenseSchema);