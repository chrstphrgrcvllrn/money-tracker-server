const Place = require("../models/Place");

const serverError = (res, label, error) => {
  console.error(`${label}:`, error.message);
  res.status(500).json({ message: "Server error" });
};

// GET all places (newest first)
const getPlaces = async (req, res) => {
  try {
    const places = await Place.findOwned(req.user.id).sort({ createdAt: -1 });
    res.json(places);
  } catch (error) {
    serverError(res, "Get places error", error);
  }
};

// CREATE a place
const createPlace = async (req, res) => {
  try {
    const { title, location, details, images, links, mapLink, specialty } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const place = await Place.createOwned(req.user.id, {
      title: title.trim(),
      location: location?.trim() || "",
      mapLink: mapLink?.trim() || "",
      specialty: specialty || "",
      details: details || "",
      images: Array.isArray(images) ? images : [],
      links: Array.isArray(links) ? links : [],
    });

    res.status(201).json(place);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    serverError(res, "Create place error", error);
  }
};

// UPDATE a place
const updatePlace = async (req, res) => {
  try {
    const { title, location, details, images, links, mapLink, specialty } = req.body;
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (location !== undefined) update.location = location.trim();
    if (mapLink !== undefined) update.mapLink = mapLink.trim();
    if (specialty !== undefined) update.specialty = specialty;
    if (details !== undefined) update.details = details;
    if (images !== undefined) update.images = images;
    if (links !== undefined) update.links = links;

    const place = await Place.updateOwned(req.user.id, req.params.id, { $set: update });
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    serverError(res, "Update place error", error);
  }
};

// DELETE a place
const deletePlace = async (req, res) => {
  try {
    const deleted = await Place.deleteOwned(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: "Place not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    serverError(res, "Delete place error", error);
  }
};

module.exports = { getPlaces, createPlace, updatePlace, deletePlace };
