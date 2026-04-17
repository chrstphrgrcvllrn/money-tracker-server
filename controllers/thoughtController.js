const Thought = require("../models/Thoughts");

// GET all
const getThoughts = async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 });
    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
const createThought = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const newThought = await Thought.create({
      text,
    });

    res.status(201).json(newThought);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getThoughts,
  createThought,
};