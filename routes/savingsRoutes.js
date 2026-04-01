const express = require("express");
const router = express.Router();

const {
  getSavings,
  createSavings,
  addTransaction,
  deleteSavings,
} = require("../controllers/savingController");

// GET all
router.get("/", getSavings);

// CREATE
router.post("/", createSavings);

// ADD transaction
router.post("/:id/transactions", addTransaction);


// DELETE savings
router.delete("/:id", deleteSavings);


module.exports = router;