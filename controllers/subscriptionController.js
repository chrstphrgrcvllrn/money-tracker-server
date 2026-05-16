const Subscription = require("../models/Subscription");

// =========================
// CREATE SUBSCRIPTION
// =========================
const createSubscription = async (req, res) => {
  try {
    const { name, amount, billing, type, startDate } = req.body;

    const subscription = await Subscription.create({
      name,
      amount,
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
    const subId = req.params.id;
    const { date, amount, status } = req.body;

    if (!subId || !date || !amount) {
      return res.status(400).json({
        message: "subId, date, amount required",
      });
    }

    const sub = await Subscription.findById(subId);
    if (!sub) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const newPayment = {
      date: new Date(date),
      amount: Number(amount),
      status: status || "pending",
    };

    sub.payments.push(newPayment);

    await sub.save();

    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// =========================
// GET
// =========================
const getSubscriptions = async (_, res) => {
  const data = await Subscription.find().sort({ createdAt: -1 });
  res.json(data);
};

// =========================
// UPDATE SUBSCRIPTION
// =========================
const updateSubscription = async (req, res) => {
  const updated = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
};

// =========================
// DELETE
// =========================
const deleteSubscription = async (req, res) => {
  await Subscription.findByIdAndDelete(req.params.id);
  res.json({ message: "deleted" });
};

// =========================
// UPDATE PAYMENT
// =========================
const updatePayment = async (req, res) => {
  try {
    const { subId, paymentId, date, status } = req.body;

    if (!subId || !paymentId) {
      return res.status(400).json({
        message: "subId and paymentId required",
      });
    }

    const sub = await Subscription.findById(subId);
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