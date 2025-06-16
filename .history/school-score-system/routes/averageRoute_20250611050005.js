const express = require("express");
const router = express.Router();
const { getStudentAverages } = require("../controllers/averageController");
const { authenticate, authorize } = require("../middleware/auth");

// Chỉ học sinh, giáo viên, admin được xem
router.get("/", authenticate, authorize(["student", "teacher", "admin"]), getStudentAverages);

module.exports = router;
