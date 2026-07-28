const express = require("express");
const router = express.Router();

const {
  getHouseExpenses,
  createHouseExpense,
  updateHouseExpense,
  toggleHouseExpense,
  deleteHouseExpense,
} = require("../controllers/houseExpenseController");

router.get("/", getHouseExpenses);
router.post("/", createHouseExpense);
router.put("/:id", updateHouseExpense);
router.patch("/:id/toggle", toggleHouseExpense);
router.delete("/:id", deleteHouseExpense);

module.exports = router;