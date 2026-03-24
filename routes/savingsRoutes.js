const express = require("express");
const router = express.Router();

const {
  getSavings,
  createSavings,
  addTransaction,
} = require("../controllers/savingController");

// GET all
router.get("/", getSavings);

// CREATE
router.post("/", createSavings);

// ADD transaction
router.post("/:id/transactions", addTransaction);

module.exports = router;