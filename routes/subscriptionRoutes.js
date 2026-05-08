const express = require("express");
const router = express.Router();

const {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  updatePayment
} = require("../controllers/subscriptionController");

router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);
router.patch("/payment", updatePayment);

module.exports = router;