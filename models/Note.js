const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: { type: String, required: true },
    done: { type: Boolean, default: false }, // ensures boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);