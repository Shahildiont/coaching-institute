const express = require("express");
const optionalAuth = require("../middleware/optionalAuth");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

const router = express.Router();

router.route("/").get(optionalAuth, getAllQuizzes).post(createQuiz);

router
  .route("/:id")
  .get(optionalAuth, getQuizById)
  .put(updateQuiz)
  .delete(deleteQuiz);

module.exports = router;