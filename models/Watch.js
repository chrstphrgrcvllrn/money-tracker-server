const mongoose = require("mongoose");

const watchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    current: { type: String, default: "" }, // S01E01
    nextRelease: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Watch", watchSchema);