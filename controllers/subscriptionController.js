const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const pick = require("../utils/pick");

const UPDATABLE = ["name", "amount", "quantity", "completed", "notes", "billing", "type", "payments"];

// =========================
// CREATE SUBSCRIPTION
// =========================
const createSubscription = async (req, res) => {
  try {
    const { name, amount, quantity, completed, notes, billing, type } = req.body;

    const subscription = await Subscription.createOwned(req.user.id, {
      name,
      amount,
      quantity: quantity || 1,
      completed: completed || false,
      notes: notes || "",
      billing,
      type,
      payments: [],
    });

    res.status(201).json(subscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =========================
// CREATE PAYMENT
// =========================
const createPayment = async (req, res) => {
  try {
    const { date, amount, status } = req.body;

    if (!date || !amount) {
      return res.status(400).json({
        message: "subId, date, amount required",
      });
    }

    const sub = await Subscription.findOneOwned(req.user.id, req.params.id);
    if (!sub) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    sub.payments.push({
      date: new Date(date),
      amount: Number(amount),
      status: status || "pending",
    });

    await sub.save();

    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =========================
// GET
// =========================
const getSubscriptions = async (req, res) => {
  const data = await Subscription.findOwned(req.user.id).sort({ createdAt: -1 });
  res.json(data);
};

// =========================
// UPDATE SUBSCRIPTION
// =========================
const updateSubscription = async (req, res) => {
  const updated = await Subscription.updateOwned(req.user.id, req.params.id, {
    $set: pick(req.body, UPDATABLE),
  });

  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
};

// =========================
// DELETE
// =========================
const deleteSubscription = async (req, res) => {
  const deleted = await Subscription.deleteOwned(req.user.id, req.params.id);

  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "deleted" });
};

// =========================
// UPDATE PAYMENT
// (this route has no :id param — the subscription id arrives in the body,
// so it is validated and ownership-checked here rather than by router.param)
// =========================
const updatePayment = async (req, res) => {
  try {
    const { subId, paymentId, date, status } = req.body;

    if (!subId || !paymentId) {
      return res.status(400).json({
        message: "subId and paymentId required",
      });
    }

    if (!mongoose.isValidObjectId(subId)) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const sub = await Subscription.findOneOwned(req.user.id, subId);
    if (!sub) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const payment = sub.payments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (date) payment.date = new Date(date);
    if (status) payment.status = status;

    await sub.save();

    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  updatePayment,
  createPayment,
};
