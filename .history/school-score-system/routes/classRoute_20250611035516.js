const express = require("express");
const router = express.Router();
const {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
} = require("../controllers/classController");

const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize(["admin"]), getAllClasses);
router.post("/", authenticate, authorize(["admin"]), createClass);
router.put("/:id", authenticate, authorize(["admin"]), updateClass);
router.delete("/:id", authenticate, authorize(["admin"]), deleteClass);
router.get("/:id/students", authenticate, authorize(["admin", "teacher"]), getClassStudents);

module.exports = router;
