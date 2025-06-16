  const express = require("express");
  const router = express.Router();
  const {
    getScores,
    createScore,
    updateScore,
    deleteScore,
    getScoresBySubjectTeacher,
    getScoresByHomeroomTeacher, // 👈 THÊM MỚI
  } = require("../controllers/scoreController");

  const { authenticate, authorize } = require("../middleware/auth");

  // GET: giáo viên và học sinh đều xem được điểm
  router.get("/", authenticate, getScores);

  // 🆕 API: Giáo viên bộ môn xem điểm môn họ dạy
  router.get("/teacher", authenticate, authorize(["teacher"]), getScoresBySubjectTeacher);

  // 🆕 API: Giáo viên chủ nhiệm xem tất cả điểm của lớp mình chủ nhiệm
  router.get("/homeroom", authenticate, authorize(["teacher"]), getScoresByHomeroomTeacher);

  // POST/PUT/DELETE: chỉ giáo viên
  router.post("/", authenticate, authorize(["teacher"]), createScore);
  router.put("/:id", authenticate, authorize(["teacher"]), updateScore);
  router.delete("/:id", authenticate, authorize(["teacher"]), deleteScore);

  module.exports = router;
