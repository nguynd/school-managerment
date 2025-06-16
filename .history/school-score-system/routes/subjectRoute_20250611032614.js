const express = require("express");
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

const { authenticate, authorize } = require("../middleware/auth");

// Chỉ admin được phép thao tác
router.get("/", authenticate, authorize(["admin"]), getSubjects);
router.post("/", authenticate, authorize(["admin"]), createSubject);
router.put("/:id", authenticate, authorize(["admin"]), updateSubject);
router.delete("/:id", authenticate, authorize(["admin"]), deleteSubject);

module.exports = router;
