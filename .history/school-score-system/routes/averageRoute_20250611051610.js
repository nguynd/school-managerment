const express = require("express");
const router = express.Router();
const { getStudentAverages ,getOverallAverage} = require("../controllers/averageController");
const { authenticate, authorize } = require("../middleware/auth");

// Chỉ học sinh, giáo viên, admin được xem
router.get("/", authenticate, authorize(["student", "teacher", "admin"]), getStudentAverages);
router.get("/overall", authenticate, authorize(["student", "teacher", "admin"]), getOverallAverage);


module.exports = router;
