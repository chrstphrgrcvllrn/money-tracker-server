const Savings = require("../models/Savings");

// GET all savings
const getSavings = async (req, res) => {
  try {
    const savings = await Savings.find();
    res.json(savings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE savings
const createSavings = async (req, res) => {
  try {
    const { name, initialAmount } = req.body;

    const savings = new Savings({
      name,
      initialAmount,
      transactions: [],
    });

    const saved = await savings.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD transaction
const addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, type } = req.body;

    const savings = await Savings.findById(id);

    if (!savings) {
      return res.status(404).json({ error: "Savings not found" });
    }

    savings.transactions.push({ date, amount, type });

    const updated = await savings.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE savings
const deleteSavings = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Savings.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Savings not found" });
    }

    res.json({ message: "Savings deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSavings,
  createSavings,
  addTransaction,
   deleteSavings,
};