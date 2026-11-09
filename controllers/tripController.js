const Trip = require("../models/Trip");

const serverError = (res, label, error) => {
  console.error(`${label}:`, error.message);
  res.status(500).json({ message: "Server error" });
};

// GET all trips (newest first)
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.findOwned(req.user.id).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    serverError(res, "Get trips error", error);
  }
};

// CREATE a trip
const createTrip = async (req, res) => {
  try {
    const { title, days } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const trip = await Trip.createOwned(req.user.id, {
      title: title.trim(),
      days: Array.isArray(days) ? days : [],
    });

    res.status(201).json(trip);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    serverError(res, "Create trip error", error);
  }
};

// UPDATE a trip
const updateTrip = async (req, res) => {
  try {
    const { title, days } = req.body;
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (days !== undefined) update.days = days;

    const trip = await Trip.updateOwned(req.user.id, req.params.id, { $set: update });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    serverError(res, "Update trip error", error);
  }
};

// DELETE a trip
const deleteTrip = async (req, res) => {
  try {
    const deleted = await Trip.deleteOwned(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    serverError(res, "Delete trip error", error);
  }
};

module.exports = { getTrips, createTrip, updateTrip, deleteTrip };
