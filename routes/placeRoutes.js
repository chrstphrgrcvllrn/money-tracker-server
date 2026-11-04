const express = require("express");
const { getPlaces, createPlace, updatePlace, deletePlace } = require("../controllers/placeController");

const router = express.Router();

router.get("/", getPlaces);
router.post("/", createPlace);
router.put("/:id", updatePlace);
router.delete("/:id", deletePlace);

module.exports = router;
