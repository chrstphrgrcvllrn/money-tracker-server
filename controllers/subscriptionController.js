const Subscription = require("../models/Subscription");

// generate next 12 cycles from NOW
const generatePayments = (amount, billing, startDate) => {
  const payments = [];
  const base = new Date(startDate);

  for (let i = 0; i < 12; i++) {
    const date = new Date(base);

    if (billing === "monthly") {
      date.setMonth(base.getMonth() + i);
    } else {
      date.setFullYear(base.getFullYear() + i);
    }

    payments.push({
      date,
      amount,
      status: "pending",
    });
  }

  return payments;
};

// CREATE
const createSubscription = async (req, res) => {
  try {
    const { name, amount, billing, type, startDate } = req.body;

    const subscription = await Subscription.create({
      name,
      amount,
      billing,
      type,
      payments:
        type === "auto"
          ? generatePayments(amount, billing, startDate)
          : [],
    });

    res.status(201).json(subscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ
const getSubscriptions = async (_, res) => {
  const data = await Subscription.find().sort({ createdAt: -1 });
  res.json(data);
};

// UPDATE
const updateSubscription = async (req, res) => {
  const updated = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// DELETE
const deleteSubscription = async (req, res) => {
  await Subscription.findByIdAndDelete(req.params.id);
  res.json({ message: "deleted" });
};

const updatePayment = async (req, res) => {
  try {
    const { subId, paymentId, date, status } = req.body;

    const sub = await Subscription.findById(subId);

    const payment = sub.payments.id(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // allow full edit
    if (date) payment.date = date;
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
  updatePayment
};