const express = require("express");
const router = express.Router();

const {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  updatePayment,
  createPayment,
} = require("../controllers/subscriptionController");

router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

// payments
router.post("/:id/payment", createPayment);
router.patch("/payment", updatePayment);

module.exports = router;