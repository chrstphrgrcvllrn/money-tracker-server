const express = require("express");
const {
  getLoans,
  createLoan,
  addTransaction,
  updateLoan,
} = require("../controllers/loanController");

const router = express.Router();

router.get("/", getLoans);
router.post("/", createLoan);
router.put("/:id", updateLoan);

// ✅ NEW ROUTE
router.post("/:id/transactions", addTransaction);

module.exports = router;

