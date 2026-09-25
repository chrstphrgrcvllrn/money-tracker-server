const NotebookNote = require("../models/NotebookNote");

const serverError = (res, label, error) => {
  console.error(`${label}:`, error.message);
  res.status(500).json({ message: "Server error" });
};

// GET all notebook notes
const getNotebookNotes = async (req, res) => {
  try {
    const notes = await NotebookNote.findOwned(req.user.id).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    serverError(res, "Get notebook notes error", error);
  }
};

// GET single notebook note
const getNotebookNote = async (req, res) => {
  try {
    const note = await NotebookNote.findOneOwned(req.user.id, req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    serverError(res, "Get notebook note error", error);
  }
};

// CREATE notebook note
const createNotebookNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await NotebookNote.createOwned(req.user.id, {
      title: title.trim(),
      content: content || "",
      status: "open",
    });

    res.status(201).json(note);
  } catch (error) {
    serverError(res, "Create notebook note error", error);
  }
};

// UPDATE notebook note
const updateNotebookNote = async (req, res) => {
  try {
    const { title, content, status } = req.body;

    const note = await NotebookNote.findOneOwned(req.user.id, req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (title !== undefined) {
      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content;
    }

    if (status !== undefined) {
      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      note.status = status;
    }

    await note.save();

    res.json(note);
  } catch (error) {
    serverError(res, "Update notebook note error", error);
  }
};

// TOGGLE status
const toggleNotebookNoteStatus = async (req, res) => {
  try {
    const note = await NotebookNote.findOneOwned(req.user.id, req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.status = note.status === "open" ? "closed" : "open";

    await note.save();

    res.json(note);
  } catch (error) {
    serverError(res, "Toggle notebook note error", error);
  }
};

// DELETE notebook note
const deleteNotebookNote = async (req, res) => {
  try {
    const note = await NotebookNote.deleteOwned(req.user.id, req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    serverError(res, "Delete notebook note error", error);
  }
};

module.exports = {
  getNotebookNotes,
  getNotebookNote,
  createNotebookNote,
  updateNotebookNote,
  toggleNotebookNoteStatus,
  deleteNotebookNote,
};
