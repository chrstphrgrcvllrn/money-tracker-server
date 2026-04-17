const express = require("express");
const router = express.Router();

const {
  getWatchlist,
  createWatchItem,
  updateWatchItem,
  deleteWatchItem,
} = require("../controllers/watchlistController");

router.get("/", getWatchlist);
router.post("/", createWatchItem);
router.patch("/:id", updateWatchItem);
router.delete("/:id", deleteWatchItem);

module.exports = router;