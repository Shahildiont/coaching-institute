const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");
const {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router
  .route("/")
  .get(protect, allowRoles("admin", "staff"), getAllCategory)
  .post(protect, allowRoles("admin"), createCategory);

router
  .route("/:id")
  .put(protect, allowRoles("admin"), updateCategory)
  .delete(protect, allowRoles("admin"), deleteCategory);

module.exports = router;