const express = require("express");
const { getOtPay, saveOtPay } = require("../controllers/otPayController");

const router = express.Router();

router.get("/", getOtPay);
router.put("/", saveOtPay);

module.exports = router;
