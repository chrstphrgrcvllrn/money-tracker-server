const OtPay = require("../models/OtPay");

// Returns the signed-in user's OT state, creating an empty one on first use.
const getOtPay = async (req, res) => {
  const doc = await OtPay.findOneAndUpdate(
    { userId: OtPay.toOwnerId(req.user.id) },
    { $setOnInsert: { userId: OtPay.toOwnerId(req.user.id) } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  res.json(doc);
};

// Replaces the whole OT state (settings, holidays, entries) in one save.
const saveOtPay = async (req, res) => {
  try {
    const { settings, holidays, entries, cutoffs, cutoffRules } = req.body;
    const doc = await OtPay.findOneAndUpdate(
      { userId: OtPay.toOwnerId(req.user.id) },
      {
        $set: {
          ...(settings !== undefined && { settings }),
          ...(holidays !== undefined && { holidays }),
          ...(entries !== undefined && { entries }),
          ...(cutoffs !== undefined && { cutoffs }),
          ...(cutoffRules !== undefined && { cutoffRules }),
        },
        $setOnInsert: { userId: OtPay.toOwnerId(req.user.id) },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true }
    );
    res.json(doc);
  } catch (err) {
    console.error("SAVE OT PAY ERROR:", err.message);
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getOtPay, saveOtPay };
