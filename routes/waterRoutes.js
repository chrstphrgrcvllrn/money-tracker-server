const express = require("express");
const { getWaterLogs, adjustWater } = require("../controllers/waterController");

const router = express.Router();

router.get("/", getWaterLogs);
router.patch("/:date", adjustWater);

module.exports = router;
