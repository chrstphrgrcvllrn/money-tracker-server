const NotebookNote = require("../models/NotebookNote");

// GET all notebook notes
const getNotebookNotes = async (req, res) => {
  try {
    const notes = await NotebookNote.find().sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Get notebook notes error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET single notebook note
const getNotebookNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const note = await NotebookNote.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json(note);
  } catch (error) {
    console.error("Get notebook note error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// CREATE notebook note
const createNotebookNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const note = await NotebookNote.create({
      title: title.trim(),
      content: content || "",
      status: "open",
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create notebook note error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE notebook note
const updateNotebookNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const note = await NotebookNote.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (title !== undefined) {
      note.title = title.trim();
    }

    if (content !== undefined) {
      note.content = content;
    }

    if (status !== undefined) {
      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      note.status = status;
    }

    await note.save();

    res.json(note);
  } catch (error) {
    console.error("Update notebook note error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// TOGGLE status
const toggleNotebookNoteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const note = await NotebookNote.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    note.status = note.status === "open" ? "closed" : "open";

    await note.save();

    res.json(note);
  } catch (error) {
    console.error("Toggle notebook note error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE notebook note
const deleteNotebookNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const note = await NotebookNote.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      message: "Deleted",
    });
  } catch (error) {
    console.error("Delete notebook note error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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