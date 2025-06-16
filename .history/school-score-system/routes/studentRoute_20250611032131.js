const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const { authenticate, authorize } = require("../middleware/auth");

// Chỉ admin được phép
router.get("/", authenticate, authorize(["admin"]), getAllStudents);
router.post("/", authenticate, authorize(["admin"]), createStudent);
router.put("/:id", authenticate, authorize(["admin"]), updateStudent);
router.delete("/:id", authenticate, authorize(["admin"]), deleteStudent);

module.exports = router;
