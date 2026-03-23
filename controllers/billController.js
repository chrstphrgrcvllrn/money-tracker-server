const MonthlyBills = require("../models/Bill");

const getMonthlyBills = async (req, res) => {
  const data = await MonthlyBills.find();
  res.json(data);
};

const addBill = async (req, res) => {
  const { monthId } = req.params;

  const month = await MonthlyBills.findById(monthId);
  if (!month) return res.status(404).json({ message: "Not found" });

  month.bills.push(req.body);
  await month.save();

  res.json(month);
};

const updateBillStatus = async (req, res) => {
  const { monthId, billId } = req.params;

  const month = await MonthlyBills.findById(monthId);
  if (!month) return res.status(404).json({ message: "Not found" });

  const bill = month.bills.id(billId);
  if (!bill) return res.status(404).json({ message: "Bill not found" });

  bill.status = req.body.status;
  await month.save();

  res.json(month);
};

const deleteBill = async (req, res) => {
  const { monthId, billId } = req.params;

  const month = await MonthlyBills.findById(monthId);
  if (!month) return res.status(404).json({ message: "Not found" });

  month.bills = month.bills.filter(
    (b) => b._id.toString() !== billId
  );

  await month.save();
  res.json(month);
};

module.exports = {
  getMonthlyBills,
  addBill,
  updateBillStatus,
  deleteBill,
};