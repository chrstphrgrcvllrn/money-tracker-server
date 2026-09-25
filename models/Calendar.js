const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const CalendarSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "exercise",
        "ooo",
        "birthday",
        "holiday",
        "leave",
        "event",
      ],
      required: true,
    },

    title: String,

    minutes: Number,
  },
  { timestamps: true }
);

CalendarSchema.plugin(userOwned);

module.exports = mongoose.model(
  "Calendar",
  CalendarSchema
);