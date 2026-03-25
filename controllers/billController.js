const Bills = require("../models/Bill");

// ✅ GET ALL
const getBills = async (req, res) => {
  try {
    const data = await Bills.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE MONTH
const createBill = async (req, res) => {
  try {
    const { month, bills } = req.body;

    const newEntry = new Bills({
      month,
      bills: bills || [],
    });

    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ UPDATE
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Bills.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ DELETE
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    await Bills.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getBills,
  createBill,
  updateBill,
  deleteBill,
};