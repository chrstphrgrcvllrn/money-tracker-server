const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const notebookNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

notebookNoteSchema.plugin(userOwned);

module.exports = mongoose.model("NotebookNote", notebookNoteSchema);