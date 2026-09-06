const express = require("express");
const {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
} = require("../controllers/trackerController");

const router = express.Router();

router.get("/", getTrackerEntries);
router.post("/", createTrackerEntry);
router.put("/:id", updateTrackerEntry);
router.delete("/:id", deleteTrackerEntry);

module.exports = router;
