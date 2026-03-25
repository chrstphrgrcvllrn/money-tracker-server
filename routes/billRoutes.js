const express = require("express");
const {
  getBills,
  createBill,
  updateBill,
  deleteBill,
} = require("../controllers/billController");

const router = express.Router();

router.get("/", getBills);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

module.exports = router;