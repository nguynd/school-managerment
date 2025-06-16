const express = require("express");
const router = express.Router();
const {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
} = require("../controllers/classController");

const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize(["admin"]), getAllClasses);
router.post("/", authenticate, authorize(["admin"]), createClass);
router.put("/:id", authenticate, authorize(["admin"]), updateClass);
router.delete("/:id", authenticate, authorize(["admin"]), deleteClass);

module.exports = router;
