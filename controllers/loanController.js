const Loan = require("../models/Loan");

// GET all loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find();
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch loans", error });
  }
};

// CREATE loan
const createLoan = async (req, res) => {
  try {
    const { name, initialAmount, transactions } = req.body;

    const loan = await Loan.create({
      name,
      initialAmount,
      transactions: transactions || [],
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Failed to create loan", error });
  }
};

// ✅ ADD TRANSACTION (IMPORTANT)
const addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, type } = req.body;

    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    loan.transactions.push({
      date,
      amount,
      type,
    });

    await loan.save();

    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Failed to add transaction", error });
  }
};

module.exports = {
  getLoans,
  createLoan,
  addTransaction,
};