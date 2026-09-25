const Note = require("../models/Note");

// GET all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.findOwned(req.user.id);
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE a new note
const createNote = async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text || !category) {
      return res.status(400).json({ message: "Text and category are required" });
    }

    const note = await Note.createOwned(req.user.id, { text, category, done: false });
    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// TOGGLE note done status safely
const toggleNote = async (req, res) => {
  try {
    const note = await Note.findOneOwned(req.user.id, req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Force done to boolean before toggling
    note.done = note.done === true ? false : true;

    await note.save();
    res.json(note);
  } catch (error) {
    console.error("Toggle note ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.deleteOwned(req.user.id, req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete note error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotes,
  createNote,
  toggleNote,
  deleteNote,
};
