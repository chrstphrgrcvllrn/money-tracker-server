const express = require("express");
const {
  getSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  addExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/salaryController");

const router = express.Router();

// Salary CRUD
router.get("/", getSalaries);
router.post("/", createSalary);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);

//
// Expense routes
//

// Add expense
router.post("/:id/expense", addExpense);

// Update expense
router.put("/:id/expense/:expenseId", updateExpense);

// Delete expense
router.delete("/:id/expense/:expenseId", deleteExpense);

module.exports = router;