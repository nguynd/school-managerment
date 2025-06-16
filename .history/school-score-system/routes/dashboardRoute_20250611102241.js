const express = require("express");
const router = express.Router();
const { getHomeroomClass, getSubjectClasses } = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/homeroom/class", authenticate, authorize(["teacher"]), getHomeroomClass);
router.get("/teacher/classes", authenticate, authorize(["teacher"]), getSubjectClasses);

module.exports = router;
