const mongoose = require("mongoose");

// For router.param(): a malformed id can't match anything, so it's a 404
// (the same answer as an id that belongs to someone else).
const validateObjectId = (_req, res, next, value) => {
  if (!mongoose.isValidObjectId(value) || String(value).length !== 24) {
    return res.status(404).json({ message: "Not found" });
  }
  next();
};

module.exports = validateObjectId;
