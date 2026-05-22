const express = require("express");
const router = express.Router();

const {
  getExpenses,
  createExpense,
  updateExpense,
  toggleExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.patch("/:id/toggle", toggleExpense);
router.delete("/:id", deleteExpense);

module.exports = router;