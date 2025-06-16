const express = require("express");
const router = express.Router();
const { getMyScores, getMyAverages } = require("../controllers/myScoreController");

const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize(["student"]), getMyScores);

module.exports = router;
