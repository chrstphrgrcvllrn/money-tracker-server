const Note = require("../models/Note");

const getNotes = async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
};

const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.json(note);
};

const toggleNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: "Not found" });

  note.done = !note.done;
  await note.save();

  res.json(note);
};

const deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

module.exports = {
  getNotes,
  createNote,
  toggleNote,
  deleteNote,
};