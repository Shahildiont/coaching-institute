const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  updateUserRole,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getAllUsers);
router.put("/:id/role", protect, allowRoles("admin"), updateUserRole);

module.exports = router;