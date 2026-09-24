const Water = require("../models/Water");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HISTORY_DAYS = 30;

// GET the most recent days that have any water logged (newest first)
const getWaterLogs = async (req, res) => {
  try {
    const logs = await Water.find().sort({ date: -1 }).limit(HISTORY_DAYS);
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch water logs" });
  }
};

// PATCH one day's glass count by +1 or -1 (never below 0). Adjusting rather
// than overwriting keeps two devices from clobbering each other's taps.
const adjustWater = async (req, res) => {
  try {
    const { date } = req.params;
    const delta = Number(req.body.delta);

    if (!DATE_PATTERN.test(date) || (delta !== 1 && delta !== -1)) {
      return res.status(400).json({ message: "Invalid date or delta" });
    }

    let log;
    if (delta === 1) {
      log = await Water.findOneAndUpdate(
        { date },
        { $inc: { glasses: 1 } },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    } else {
      // Only decrement when there's something to remove.
      log =
        (await Water.findOneAndUpdate(
          { date, glasses: { $gt: 0 } },
          { $inc: { glasses: -1 } },
          { returnDocument: "after" }
        )) ||
        (await Water.findOne({ date })) || { date, glasses: 0 };
    }

    res.status(200).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update water log" });
  }
};

module.exports = { getWaterLogs, adjustWater };
