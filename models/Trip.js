const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const MAX_DAYS = 60;
const MAX_PLACES_PER_DAY = 30;

// A day is just a label ("Day 1", "Nov 12") plus an ordered list of Place
// ids — no separate _id since the whole `days` array is replaced wholesale
// on every update (same pattern as Place's `images`/`links` arrays).
const tripDaySchema = new mongoose.Schema(
  {
    label: { type: String, default: "", trim: true, maxlength: 200 },
    placeIds: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= MAX_PLACES_PER_DAY,
        message: `A day can have at most ${MAX_PLACES_PER_DAY} places`,
      },
    },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    days: {
      type: [tripDaySchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= MAX_DAYS,
        message: `A trip can have at most ${MAX_DAYS} days`,
      },
    },
  },
  { timestamps: true }
);

tripSchema.plugin(userOwned);

module.exports = mongoose.model("Trip", tripSchema);
