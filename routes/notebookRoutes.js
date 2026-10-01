const express = require("express");

const {
  getNotebookNotes,
  getNotebookNote,
  createNotebookNote,
  updateNotebookNote,
  toggleNotebookNoteStatus,
  toggleNotebookNotePinned,
  deleteNotebookNote,
} = require("../controllers/notebookController");

const router = express.Router();

router.get("/", getNotebookNotes);
router.get("/:id", getNotebookNote);

router.post("/", createNotebookNote);

router.patch("/:id", updateNotebookNote);
router.patch("/:id/toggle", toggleNotebookNoteStatus);
router.patch("/:id/pin", toggleNotebookNotePinned);

router.delete("/:id", deleteNotebookNote);

module.exports = router;