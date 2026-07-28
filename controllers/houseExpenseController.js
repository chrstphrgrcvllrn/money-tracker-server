const HouseExpense = require("../models/HouseExpense");

// GET
const getHouseExpenses = async (req, res) => {
  const expenses = await HouseExpense.find().sort({ createdAt: -1 });
  res.json(expenses);
};

// CREATE
const createHouseExpense = async (req, res) => {
  const { text, amount, category } = req.body;

  const expense = await HouseExpense.create({
    text,
    amount,
    category: category || "other",
    done: false,
  });

  res.status(201).json(expense);
};

// UPDATE
const updateHouseExpense = async (req, res) => {
  const updateData = {};

  if (req.body.text !== undefined) updateData.text = req.body.text;
  if (req.body.amount !== undefined) updateData.amount = req.body.amount;
  if (req.body.category !== undefined) updateData.category = req.body.category;

  const expense = await HouseExpense.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json(expense);
};

// TOGGLE
const toggleHouseExpense = async (req, res) => {
  const expense = await HouseExpense.findById(req.params.id);

  if (!expense)
    return res.status(404).json({ message: "Not found" });

  expense.done = !expense.done;
  await expense.save();

  res.json(expense);
};

// DELETE
const deleteHouseExpense = async (req, res) => {
  await HouseExpense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

module.exports = {
  getHouseExpenses,
  createHouseExpense,
  updateHouseExpense,
  toggleHouseExpense,
  deleteHouseExpense,
};