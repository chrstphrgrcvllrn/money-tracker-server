const Loan = require("../models/Loan");

// GET all loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.findOwned(req.user.id);
    res.status(200).json(loans);
  } catch (error) {
    console.error(error.message);
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

    const loan = await Loan.createOwned(req.user.id, {
      name,
      initialAmount: Number(initialAmount),
      transactions: [],
    });

    res.status(201).json(loan);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to create loan" });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { date, amount, type, notes } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    const loan = await Loan.findOneOwned(req.user.id, req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (!Array.isArray(loan.transactions)) {
      loan.transactions = [];
    }

    const transaction = {
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      amount: parsedAmount,
      type: type || "payment",
    };

    loan.transactions.push({
      date: new Date(transaction.date), // ensures proper Date type
      amount: transaction.amount,
      type: transaction.type,
      notes: typeof notes === "string" ? notes.trim().slice(0, 500) : "",
    });

    await loan.save();

    // The whole loan (not just the pushed transaction) so the client gets the
    // real _id Mongoose assigned to it — needed to delete that entry later.
    res.status(201).json(loan);
  } catch (error) {
    console.error("ADD TRANSACTION ERROR:", error.message);
    res.status(500).json({ message: "Failed to add transaction" });
  }
};

// DELETE one transaction from a loan (e.g. a mis-entered payment)
const deleteTransaction = async (req, res) => {
  try {
    const { id, transactionId } = req.params;

    const loan = await Loan.findOneOwned(req.user.id, id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const transaction = loan.transactions.id(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    loan.transactions.pull({ _id: transactionId });
    await loan.save();

    res.status(200).json(loan);
  } catch (error) {
    console.error("DELETE TRANSACTION ERROR:", error.message);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

// UPDATE loan (e.g. archive/unarchive, rename, edit amount)
const updateLoan = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.initialAmount !== undefined) updateData.initialAmount = Number(req.body.initialAmount);
    if (req.body.archived !== undefined) updateData.archived = Boolean(req.body.archived);

    const loan = await Loan.updateOwned(req.user.id, req.params.id, { $set: updateData });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("UPDATE LOAN ERROR:", error.message);
    res.status(500).json({ message: "Failed to update loan" });
  }
};

// DELETE a whole loan (and its payments with it). Owner-scoped: someone else's
// loan id comes back as 404, the same as a missing one.
const deleteLoan = async (req, res) => {
  try {
    const deleted = await Loan.deleteOwned(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: "Loan not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE LOAN ERROR:", err.message);
    res.status(500).json({ message: "Failed to delete loan" });
  }
};

// UPDATE the notes on one existing transaction
const updateTransactionNotes = async (req, res) => {
  try {
    const { id, transactionId } = req.params;
    const { notes } = req.body;
    if (typeof notes !== "string") {
      return res.status(400).json({ message: "Notes must be text" });
    }

    const loan = await Loan.findOneOwned(req.user.id, id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const transaction = loan.transactions.id(transactionId);
    if (!transaction) return res.status(404).json({ message: "Entry not found" });

    transaction.notes = notes.trim().slice(0, 500);
    await loan.save();
    res.json(loan);
  } catch (error) {
    console.error("UPDATE TRANSACTION NOTES ERROR:", error.message);
    res.status(500).json({ message: "Failed to update notes" });
  }
};

module.exports = {
  updateTransactionNotes,
  getLoans,
  createLoan,
  addTransaction,
  deleteTransaction,
  updateLoan,
  deleteLoan,
};
