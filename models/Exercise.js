const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  date: {
    type: String, // "YYYY-MM-DD"
    required: true,
    unique: true,
  },
  minutes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Exercise", exerciseSchema);