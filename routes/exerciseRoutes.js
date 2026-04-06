const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");

// Get all exercise data
router.get("/", async (req, res) => {
  try {
    const data = await Exercise.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update minutes
router.post("/", async (req, res) => {
  try {
    const { date, minutes } = req.body;

    const existing = await Exercise.findOne({ date });

    if (existing) {
      existing.minutes += minutes;
      await existing.save();
      return res.json(existing);
    }

    const newEntry = new Exercise({ date, minutes });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset a day
router.delete("/:date", async (req, res) => {
  try {
    await Exercise.findOneAndDelete({ date: req.params.date });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;