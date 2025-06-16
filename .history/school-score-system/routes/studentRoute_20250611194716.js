const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsWithGrading,
} = require("../controllers/studentController");

const { authenticate, authorize } = require("../middleware/auth");

// Chỉ admin được phép
router.get("/", authenticate, authorize(["admin"]), getAllStudents);
router.post("/", authenticate, authorize(["admin"]), createStudent);
router.put("/:id", authenticate, authorize(["admin"]), updateStudent);
router.delete("/:id", authenticate, authorize(["admin"]), deleteStudent);
router.get(
  "/class/:id/students-with-grading",
  authenticate,
  authorize(["teacher", "admin"]),
  getStudentsWithGrading
);
module.exports = router;
