const mongoose = require("mongoose");

const thoughtSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Thought", thoughtSchema);