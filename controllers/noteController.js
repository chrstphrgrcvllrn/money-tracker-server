const Note = require("../models/Note");

// GET all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CREATE a new note
const createNote = async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text || !category) {
      return res.status(400).json({ message: "Text and category are required" });
    }

    const note = await Note.create({ text, category, done: false });
    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// TOGGLE note done status safely
const toggleNote = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Force done to boolean before toggling
    note.done = note.done === true ? false : true;

    await note.save();
    res.json(note);
  } catch (error) {
    console.error("Toggle note ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE a note
const deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findByIdAndDelete(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotes,
  createNote,
  toggleNote,
  deleteNote,
};