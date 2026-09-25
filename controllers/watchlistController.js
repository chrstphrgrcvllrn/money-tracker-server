const Watch = require("../models/Watch");
const pick = require("../utils/pick");

const FIELDS = ["title", "current", "nextRelease", "status", "link"];

// GET ALL
const getWatchlist = async (req, res) => {
  try {
    const data = await Watch.findOwned(req.user.id).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
const createWatchItem = async (req, res) => {
  try {
    const { title, current, nextRelease, status, link } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newItem = await Watch.createOwned(req.user.id, {
      title,
      current,
      nextRelease,
      status,
      link,
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
const updateWatchItem = async (req, res) => {
  try {
    const updated = await Watch.updateOwned(req.user.id, req.params.id, {
      $set: pick(req.body, FIELDS),
    });

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
    const deleted = await Watch.deleteOwned(req.user.id, req.params.id);

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
