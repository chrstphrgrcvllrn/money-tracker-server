const Tracker = require("../models/Tracker");
const pick = require("../utils/pick");

const FIELDS = ["category", "name", "details", "date", "amount", "price", "notes"];

// GET all tracker entries
const getTrackerEntries = async (req, res) => {
  try {
    const entries = await Tracker.findOwned(req.user.id).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch tracker entries" });
  }
};

// CREATE tracker entry
const createTrackerEntry = async (req, res) => {
  try {
    const { category, name, details, date, amount, price, notes } = req.body;

    if (!category || !name || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const entry = await Tracker.createOwned(req.user.id, {
      category,
      name,
      details: details || "",
      date,
      amount: Number(amount) || 0,
      price: Number(price) || 0,
      notes: notes || "",
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to create tracker entry" });
  }
};

// UPDATE tracker entry
const updateTrackerEntry = async (req, res) => {
  try {
    const entry = await Tracker.updateOwned(req.user.id, req.params.id, {
      $set: pick(req.body, FIELDS),
    });

    if (!entry) {
      return res.status(404).json({ message: "Tracker entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to update tracker entry" });
  }
};

// DELETE tracker entry
const deleteTrackerEntry = async (req, res) => {
  try {
    const deleted = await Tracker.deleteOwned(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Tracker entry not found" });
    }

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete tracker entry" });
  }
};

module.exports = {
  getTrackerEntries,
  createTrackerEntry,
  updateTrackerEntry,
  deleteTrackerEntry,
};
