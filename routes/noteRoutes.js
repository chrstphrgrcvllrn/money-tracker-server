const express = require("express");
const {
  getNotes,
  createNote,
  toggleNote,
  deleteNote,
} = require("../controllers/noteController");

const router = express.Router();

router.get("/", getNotes);
router.post("/", createNote);
router.patch("/:id", toggleNote);
router.delete("/:id", deleteNote);

module.exports = router;