const Savings = require("../models/Savings");

// GET all savings
const getSavings = async (req, res) => {
  try {
    const savings = await Savings.findOwned(req.user.id);
    res.json(savings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE savings
const createSavings = async (req, res) => {
  try {
    const { name, initialAmount } = req.body;

    const saved = await Savings.createOwned(req.user.id, {
      name,
      initialAmount,
      transactions: [],
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD transaction
const addTransaction = async (req, res) => {
  try {
    const { date, amount, type } = req.body;

    const savings = await Savings.findOneOwned(req.user.id, req.params.id);

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
    const deleted = await Savings.deleteOwned(req.user.id, req.params.id);

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
