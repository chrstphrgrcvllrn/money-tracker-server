const Loan = require("../models/Loan");

// GET all loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find();
    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch loans" });
  }
};

// CREATE loan
const createLoan = async (req, res) => {
  try {
    const { name, initialAmount } = req.body;

    if (!name || !initialAmount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const loan = await Loan.create({
      name,
      initialAmount: Number(initialAmount),
      transactions: [],
    });

    res.status(201).json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create loan" });
  }
};


const addTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    let { date, amount, type } = req.body;

    console.log("REQ PARAMS:", req.params);
    console.log("REQ BODY:", req.body);

    if (amount === undefined) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    console.log("Searching for loan with id:", id);
    const loan = await Loan.findById(id);
    console.log("Found loan:", loan);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (!Array.isArray(loan.transactions)) {
      console.log("Transactions array missing, initializing");
      loan.transactions = [];
    }

    const transaction = {
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      amount: parsedAmount,
      type: type || "payment",
    };

    console.log("Pushing transaction:", transaction);
 loan.transactions.push({
  date: new Date(transaction.date), // ensures proper Date type
  amount: transaction.amount,
  type: transaction.type,
});

    await loan.save();
    console.log("Transaction saved successfully");

    res.status(201).json(transaction);
  } catch (error) {
    console.error("ADD TRANSACTION ERROR:", error);
    res.status(500).json({ message: "Failed to add transaction", error: error.message });
  }
};


module.exports = {
  getLoans,
  createLoan,
  addTransaction,
};