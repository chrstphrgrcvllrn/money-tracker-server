const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const thoughtSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { timestamps: true }
);

thoughtSchema.plugin(userOwned);

module.exports = mongoose.model("Thought", thoughtSchema);