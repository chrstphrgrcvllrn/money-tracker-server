const Calendar = require("../models/Calendar");
const pick = require("../utils/pick");

const FIELDS = ["date", "type", "title", "minutes"];

// GET ALL
exports.getEvents = async (req, res) => {
  const events = await Calendar.findOwned(req.user.id);
  res.json(events);
};

// CREATE
exports.createEvent = async (req, res) => {
  try {
    const event = await Calendar.createOwned(req.user.id, pick(req.body, FIELDS));
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
