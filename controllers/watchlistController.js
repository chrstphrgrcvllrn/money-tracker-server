const Watch = require("../models/Watch");

// GET ALL
const getWatchlist = async (req, res) => {
  try {
    const data = await Watch.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
const createWatchItem = async (req, res) => {
  try {
    const { title, current, nextRelease, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newItem = await Watch.create({
      title,
      current,
      nextRelease,
      status,
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE (THIS POWERS YOUR EDIT FEATURE)
const updateWatchItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Watch.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,      // return updated doc
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
const deleteWatchItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Watch.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getWatchlist,
  createWatchItem,
  updateWatchItem,
  deleteWatchItem,
};