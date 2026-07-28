const Expense = require("../models/Expense");

// GET
const getExpenses = async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 });
  res.json(expenses);
};

// CREATE
const createExpense = async (req, res) => {
  const { text, amount, category } = req.body;

  const expense = await Expense.create({
    text,
    amount,
    category: category || "other",
    done: false,
  });

  res.status(201).json(expense);
};

// UPDATE
const updateExpense = async (req, res) => {
  const updateData = {};

  if (req.body.text !== undefined) updateData.text = req.body.text;
  if (req.body.amount !== undefined) updateData.amount = req.body.amount;
  if (req.body.category !== undefined) updateData.category = req.body.category;

  const expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    {
      new: true, // use this OR returnDocument
      runValidators: true,
    }
  );

  res.json(expense);
};

// TOGGLE
const toggleExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) return res.status(404).json({ message: "Not found" });

  expense.done = !expense.done;
  await expense.save();

  res.json(expense);
};

// DELETE
const deleteExpense = async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  toggleExpense,
  deleteExpense,
};