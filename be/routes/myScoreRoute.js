const express = require("express");
const router = express.Router();
const { getMyScores, getMyAverages, getMySummary } = require("../controllers/myScoreController");

const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize(["student"]), getMyScores);
router.get("/averages", authenticate, authorize(["student"]), getMyAverages);
router.get("/summary", authenticate, authorize(["student"]), getMySummary); // ✅ thêm dòng này


module.exports = router;
