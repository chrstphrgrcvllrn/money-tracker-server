const HouseExpense = require("../models/HouseExpense");
const pick = require("../utils/pick");

const UPDATABLE = ["text", "amount", "category", "borrowedBy"];

// GET
const getHouseExpenses = async (req, res) => {
  const expenses = await HouseExpense.findOwned(req.user.id).sort({ createdAt: -1 });
  res.json(expenses);
};

// CREATE
const createHouseExpense = async (req, res) => {
  const { text, amount, category, borrowedBy } = req.body;

  const expense = await HouseExpense.createOwned(req.user.id, {
    text,
    amount,
    category: category || "other",
    borrowedBy: borrowedBy || "",
    done: false,
  });

  res.status(201).json(expense);
};

// UPDATE
const updateHouseExpense = async (req, res) => {
  const expense = await HouseExpense.updateOwned(req.user.id, req.params.id, {
    $set: pick(req.body, UPDATABLE),
  });

  if (!expense) return res.status(404).json({ message: "Not found" });
  res.json(expense);
};

// TOGGLE
const toggleHouseExpense = async (req, res) => {
  const expense = await HouseExpense.findOneOwned(req.user.id, req.params.id);

  if (!expense) return res.status(404).json({ message: "Not found" });

  expense.done = !expense.done;
  await expense.save();

  res.json(expense);
};

// DELETE
const deleteHouseExpense = async (req, res) => {
  const deleted = await HouseExpense.deleteOwned(req.user.id, req.params.id);

  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

module.exports = {
  getHouseExpenses,
  createHouseExpense,
  updateHouseExpense,
  toggleHouseExpense,
  deleteHouseExpense,
};
