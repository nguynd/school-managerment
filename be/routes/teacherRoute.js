const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

// GET /api/teachers - Lấy danh sách giáo viên
router.get("/", teacherController.getAllTeachers);

module.exports = router;
