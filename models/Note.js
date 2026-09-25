const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: { type: String, required: true },
    done: { type: Boolean, default: false }, // ensures boolean
  },
  { timestamps: true }
);

noteSchema.plugin(userOwned);

module.exports = mongoose.model("Note", noteSchema);