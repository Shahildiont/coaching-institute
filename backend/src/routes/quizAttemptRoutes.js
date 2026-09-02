const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  submitQuizAttempt,
  getMyAttemptById,
} = require("../controllers/quizAttemptController");

const router = express.Router();

router.post("/quizzes/:quizId/attempts", protect, submitQuizAttempt);
router.get("/attempts/:id", protect, getMyAttemptById);

module.exports = router;