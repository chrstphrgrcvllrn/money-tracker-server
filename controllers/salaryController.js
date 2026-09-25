const Salary = require("../models/Salary");
const pick = require("../utils/pick");

const SALARY_UPDATABLE = ["date", "salary", "expenses"];
const EXPENSE_FIELDS = ["name", "amount", "paid"];

// GET all salaries
const getSalaries = async (req, res) => {
  const data = await Salary.findOwned(req.user.id);
  res.json(data);
};

// CREATE salary (with optional expenses)
const createSalary = async (req, res) => {
  try {
    const { date, salary, expenses } = req.body;

    if (!date || salary === undefined) {
      return res.status(400).json({ message: "Date and salary are required" });
    }

    const newSalary = await Salary.createOwned(req.user.id, {
      date,
      salary,
      expenses: Array.isArray(expenses) ? expenses : [], // ✅ safe fallback
    });

    res.status(201).json(newSalary);
  } catch (err) {
    console.error("CREATE SALARY ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE salary (basic fields like date/salary, or the expenses list)
const updateSalary = async (req, res) => {
  try {
    const data = await Salary.updateOwned(req.user.id, req.params.id, {
      $set: pick(req.body, SALARY_UPDATABLE),
    });

    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    console.error("UPDATE SALARY ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE salary
const deleteSalary = async (req, res) => {
  const deleted = await Salary.deleteOwned(req.user.id, req.params.id);

  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

//
// ✅ EXPENSES (owned through their parent salary)
//

// ADD expense
const addExpense = async (req, res) => {
  const salary = await Salary.findOneOwned(req.user.id, req.params.id);
  if (!salary) return res.status(404).json({ message: "Not found" });

  salary.expenses.push(pick(req.body, EXPENSE_FIELDS));

  await salary.save();

  res.json(salary);
};

// UPDATE expense
const updateExpense = async (req, res) => {
  const { id, expenseId } = req.params;

  const salary = await Salary.findOneOwned(req.user.id, id);
  if (!salary) return res.status(404).json({ message: "Not found" });

  const expense = salary.expenses.id(expenseId);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  expense.name = req.body.name;
  expense.amount = req.body.amount;

  await salary.save();

  res.json(salary);
};

// DELETE expense
const deleteExpense = async (req, res) => {
  const { id, expenseId } = req.params;

  const salary = await Salary.findOneOwned(req.user.id, id);
  if (!salary) return res.status(404).json({ message: "Not found" });

  const expense = salary.expenses.id(expenseId);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  // (subdocument .remove() no longer exists in Mongoose 9)
  salary.expenses.pull({ _id: expenseId });

  await salary.save();

  res.json(salary);
};

module.exports = {
  getSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  addExpense,
  updateExpense,
  deleteExpense,
};
