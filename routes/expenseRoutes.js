const express = require("express");
const router = express.Router();

const {
  getExpenses,
  createExpense,
  toggleExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id/toggle", toggleExpense);
router.delete("/:id", deleteExpense); // optional

module.exports = router;