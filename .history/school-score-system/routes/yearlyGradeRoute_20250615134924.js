const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth"); // tuỳ dự án
const {
  calculateYearlyGrade,
  getYearlyGrade,
} = require("../controllers/yearGradeController");

const router = express.Router();

// Giáo viên hoặc admin được phép tính/lưu điểm năm
router.post(
  "/yearly-grades/calculate",
  authenticate,
  authorize(["admin", "teacher"]),
  calculateYearlyGrade
);

// Bất kỳ user đã đăng nhập đều có thể xem
router.get("/yearly-grades", authenticate, getYearlyGrade);

module.exports = router;
