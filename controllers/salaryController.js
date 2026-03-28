const Salary = require("../models/Salary");

// GET all salaries
const getSalaries = async (req, res) => {
  const data = await Salary.find();
  res.json(data);
};

// CREATE salary (with optional expenses)
const createSalary = async (req, res) => {
  try {
    const { date, salary, expenses } = req.body;

    if (!date || salary === undefined) {
      return res.status(400).json({ message: "Date and salary are required" });
    }

    const newSalary = new Salary({
      date,
      salary,
      expenses: Array.isArray(expenses) ? expenses : [], // ✅ safe fallback
    });

    await newSalary.save();

    res.status(201).json(newSalary);
  } catch (err) {
    console.error("CREATE SALARY ERROR:", err); // ✅ this will expose the real issue
    res.status(500).json({ message: err.message });
  }
};
// UPDATE salary (basic fields like month/salary)
const updateSalary = async (req, res) => {
  try {
    const data = await Salary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(data);
  } catch (err) {
    console.error("UPDATE SALARY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE salary
const deleteSalary = async (req, res) => {
  await Salary.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

//
// ✅ EXPENSES
//

// ADD expense
const addExpense = async (req, res) => {
  const { id } = req.params;

  const salary = await Salary.findById(id);
  if (!salary) return res.status(404).json({ message: "Not found" });

  salary.expenses.push(req.body);

  await salary.save();

  res.json(salary);
};

// UPDATE expense
const updateExpense = async (req, res) => {
  const { id, expenseId } = req.params;

  const salary = await Salary.findById(id);
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

  const salary = await Salary.findById(id);
  if (!salary) return res.status(404).json({ message: "Not found" });

  const expense = salary.expenses.id(expenseId);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  expense.remove();

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