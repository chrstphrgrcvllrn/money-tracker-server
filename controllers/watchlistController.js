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
    const {
      title,
      current,
      nextRelease,
      status,
      link, // NEW
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const newItem = await Watch.create({
      title,
      current,
      nextRelease,
      status,
      link, // NEW
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE
const updateWatchItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Watch.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE
const deleteWatchItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Watch.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json(deleted);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getWatchlist,
  createWatchItem,
  updateWatchItem,
  deleteWatchItem,
};