const Expense = require("../models/Expense");

// GET all
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// CREATE
exports.createExpense = async (req, res) => {
  try {
    const { text, amount } = req.body;

    const expense = new Expense({
      text,
      amount,
      done: false,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to create expense" });
  }
};

// TOGGLE
exports.toggleExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.done = !expense.done;
    await expense.save();

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle expense" });
  }
};

// DELETE (optional)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense" });
  }
};