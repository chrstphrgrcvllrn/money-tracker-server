const express = require("express");

const {
  getNotebookNotes,
  getNotebookNote,
  createNotebookNote,
  updateNotebookNote,
  toggleNotebookNoteStatus,
  deleteNotebookNote,
} = require("../controllers/notebookController");

const router = express.Router();

router.get("/", getNotebookNotes);
router.get("/:id", getNotebookNote);

router.post("/", createNotebookNote);

router.patch("/:id", updateNotebookNote);
router.patch("/:id/toggle", toggleNotebookNoteStatus);

router.delete("/:id", deleteNotebookNote);

module.exports = router;