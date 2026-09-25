const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const billSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  paid: { type: Boolean, default: false },
});

const billsEntrySchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    bills: { type: [billSchema], default: [] },
  },
  { timestamps: true }
);

billsEntrySchema.plugin(userOwned);

module.exports = mongoose.model("Bills", billsEntrySchema);