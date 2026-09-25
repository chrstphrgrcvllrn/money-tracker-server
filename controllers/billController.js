const Bills = require("../models/Bill");
const pick = require("../utils/pick");

const UPDATABLE = ["month", "bills"];

// ✅ GET ALL
const getBills = async (req, res) => {
  try {
    const data = await Bills.findOwned(req.user.id).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE MONTH
const createBill = async (req, res) => {
  try {
    const { month, bills } = req.body;

    const saved = await Bills.createOwned(req.user.id, { month, bills: bills || [] });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ UPDATE
const updateBill = async (req, res) => {
  try {
    const updated = await Bills.updateOwned(req.user.id, req.params.id, {
      $set: pick(req.body, UPDATABLE),
    });

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ DELETE
const deleteBill = async (req, res) => {
  try {
    const deleted = await Bills.deleteOwned(req.user.id, req.params.id);

    if (!deleted) return res.status(404).json({ message: "Not found" });
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
