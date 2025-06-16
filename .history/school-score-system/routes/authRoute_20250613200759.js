const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const { login, 
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,} = require("../controllers/authController");

router.post("/login", login);
router.get("/", authenticate, authorize(["admin"]), getAllUsers);
router.post("/", authenticate, authorize(["admin"]), createUser);
router.put("/:id", authenticate, authorize(["admin"]), updateUser);
router.delete("/:id", authenticate, authorize(["admin"]), deleteUser);

module.exports = router;
