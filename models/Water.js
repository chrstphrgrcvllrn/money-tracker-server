const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

// One document per calendar day ("YYYY-MM-DD"), holding how many glasses of
// water were drunk that day.
const waterSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    glasses: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

waterSchema.plugin(userOwned);

// One log per user per day. (This used to be unique on date alone, which would
// stop two users logging water on the same day; the migration drops that index.)
waterSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Water", waterSchema);
