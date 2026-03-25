const express = require("express");
const router = express.Router();

const {
  getExpenses,
  createExpense,
  updateExpense,
  toggleExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// GET all
router.get("/", getExpenses);

// CREATE
router.post("/", createExpense);

// UPDATE
router.put("/:id", updateExpense);

// TOGGLE
router.patch("/:id/toggle", toggleExpense);

// DELETE
router.delete("/:id", deleteExpense);

module.exports = router;