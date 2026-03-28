const express = require("express");
const {
  getLoans,
  createLoan,
  addTransaction,
} = require("../controllers/loanController");

const router = express.Router();

router.get("/", getLoans);
router.post("/", createLoan);

// ✅ NEW ROUTE
router.post("/:id/transactions", addTransaction);

module.exports = router;

