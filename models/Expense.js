const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

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

expenseSchema.plugin(userOwned);

module.exports = mongoose.model("Expense", expenseSchema);