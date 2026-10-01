const express = require("express");
const {
  getLoans,
  createLoan,
  addTransaction,
  deleteTransaction,
  updateLoan,
} = require("../controllers/loanController");

const router = express.Router();

router.get("/", getLoans);
router.post("/", createLoan);
router.put("/:id", updateLoan);

router.post("/:id/transactions", addTransaction);
router.delete("/:id/transactions/:transactionId", deleteTransaction);

module.exports = router;

