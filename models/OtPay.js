const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const holidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    name: { type: String, default: "" },
    type: { type: String, enum: ["regular_holiday", "special"], required: true },
  },
  { _id: false }
);

// A date range whose shifts are placed automatically in one cutoff.
const cutoffRuleSchema = new mongoose.Schema(
  {
    from: { type: String, required: true }, // "YYYY-MM-DD", inclusive
    to: { type: String, required: true }, // "YYYY-MM-DD", inclusive
    cutoff: { type: String, required: true },
  },
  { _id: false }
);

const entrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    breakStart: { type: String },
    breakMinutes: { type: Number, min: 0, default: 60 },
    hoursFiled: { type: Number, min: 0, default: 0 },
    actualPaid: { type: Number, min: 0 },
    // Which pay cutoff this shift is placed in (a label from the cutoffs list).
    cutoff: { type: String, default: "" },
  },
  { _id: false }
);

// One document per user: the pay settings, the holiday table, and the OT log.
const otPaySchema = new mongoose.Schema(
  {
    settings: {
      monthlySalary: { type: Number, default: 0, min: 0 },
      workDaysPerYear: { type: Number, enum: [261, 262, 313, 365], default: 261 },
      restDays: { type: [{ type: String, enum: WEEKDAYS }], default: ["Sat", "Sun"] },
      taxablePerCutoff: { type: Number, default: 0, min: 0 },
    },
    holidays: { type: [holidaySchema], default: [] },
    entries: { type: [entrySchema], default: [] },
    // Named pay cutoffs that entries can be placed in.
    cutoffs: { type: [String], default: [] },
    // Automatic placement: a shift's start date picks the cutoff of the rule covering it.
    cutoffRules: { type: [cutoffRuleSchema], default: [] },
  },
  { timestamps: true }
);

otPaySchema.plugin(userOwned);

module.exports = mongoose.model("OtPay", otPaySchema);
