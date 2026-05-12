const Calendar = require("../models/Calendar");

// GET ALL
exports.getEvents = async (req, res) => {
  const events = await Calendar.find();
  res.json(events);
};

// CREATE
exports.createEvent = async (req, res) => {
  const event = await Calendar.create(req.body);
  res.json(event);
};