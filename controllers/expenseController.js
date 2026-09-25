const Expense = require("../models/Expense");
const pick = require("../utils/pick");

const UPDATABLE = ["text", "amount", "category"];

// GET
const getExpenses = async (req, res) => {
  const expenses = await Expense.findOwned(req.user.id).sort({ createdAt: -1 });
  res.json(expenses);
};

// CREATE
const createExpense = async (req, res) => {
  const { text, amount, category } = req.body;

  const expense = await Expense.createOwned(req.user.id, {
    text,
    amount,
    category: category || "other",
    done: false,
  });

  res.status(201).json(expense);
};

// UPDATE
const updateExpense = async (req, res) => {
  const expense = await Expense.updateOwned(req.user.id, req.params.id, {
    $set: pick(req.body, UPDATABLE),
  });

  if (!expense) return res.status(404).json({ message: "Not found" });
  res.json(expense);
};

// TOGGLE
const toggleExpense = async (req, res) => {
  const expense = await Expense.findOneOwned(req.user.id, req.params.id);

  if (!expense) return res.status(404).json({ message: "Not found" });

  expense.done = !expense.done;
  await expense.save();

  res.json(expense);
};

// DELETE
const deleteExpense = async (req, res) => {
  const deleted = await Expense.deleteOwned(req.user.id, req.params.id);

  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  toggleExpense,
  deleteExpense,
};
