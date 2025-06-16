const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsWithGrading,
  getStudentsByClass,
} = require("../controllers/studentController");

const { authenticate, authorize } = require("../middleware/auth");

// Chỉ admin được phép
router.get("/", authenticate, authorize(["teacher", "admin"]), getAllStudents);
router.post("/", authenticate, authorize(["teacher", "admin"]), createStudent);
router.put("/:id", authenticate, authorize(["teacher", "admin"]), updateStudent);
router.delete("/:id", authenticate, authorize(["teacher", "admin"]), deleteStudent);
router.get(
  "/class/:id/students-with-grading",
  authenticate,
  authorize(["teacher", "admin"]),
  getStudentsWithGrading
);
router.get("/class/:classId", authenticate, authorize(["teacher", "admin"]),getStudentsByClass);
module.exports = router;
