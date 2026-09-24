const mongoose = require("mongoose");

// One document per calendar day ("YYYY-MM-DD"), holding how many glasses of
// water were drunk that day.
const waterSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    glasses: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Water", waterSchema);
