const express = require("express");
const {
  getMonthlyBills,
  addBill,
  updateBillStatus,
  deleteBill,
} = require("../controllers/billController");

const router = express.Router();

router.get("/", getMonthlyBills);
router.post("/:monthId/bills", addBill);
router.patch("/:monthId/bills/:billId", updateBillStatus);
router.delete("/:monthId/bills/:billId", deleteBill);

module.exports = router;