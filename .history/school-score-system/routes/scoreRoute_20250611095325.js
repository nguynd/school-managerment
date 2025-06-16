const express = require("express");
const router = express.Router();
const {
  getScores,
  createScore,
  updateScore,
  deleteScore,
  getScoresBySubjectTeacher,
  getScoresByHomeroomTeacher
} = require("../controllers/scoreController");

const { authenticate, authorize } = require("../middleware/auth");

// GET: giáo viên và học sinh đều xem được điểm
router.get("/", authenticate, getScores);

// POST/PUT/DELETE: chỉ giáo viên
router.post("/", authenticate, authorize(["teacher"]), createScore);
router.put("/:id", authenticate, authorize(["teacher"]), updateScore);
router.delete("/:id", authenticate, authorize(["teacher"]), deleteScore);
router.get('/teacher', scoreController.getScoresBySubjectTeacher);
router.get('/homeroom', scoreController.getScoresByHomeroomTeacher);


module.exports = router;
