const express = require("express");
const router = express.Router();
const { getAllGradings, getStudentGrading } = require("../controllers/gradingController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, getAllGradings); // GET /api/gradings
router.get("/:student_id", authenticate, authorize(["teacher", "admin"]), getStudentGrading); // /api/grades/:student_id

module.exports = router;
