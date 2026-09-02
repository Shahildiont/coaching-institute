const express = require("express");
const optionalAuth = require("../middleware/optionalAuth");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");

const upload = require("../middleware/upload");


const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUploadQuestions,
} = require("../controllers/questionController");

const router = express.Router();

router
  .route("/")
  .get(protect, allowRoles("admin", "staff", "student"), getAllQuestions)
  .post(protect, allowRoles("admin", "staff"), createQuestion);

router
  .route("/:id")
  .get(protect, allowRoles("admin", "staff", "student"), getQuestionById)
  .put(protect, allowRoles("admin", "staff"), updateQuestion)
  .delete(protect, allowRoles("admin", "staff"), deleteQuestion);
  


router.post(
  "/bulk-upload",
  upload.single("file"),
  bulkUploadQuestions
);

module.exports = router;