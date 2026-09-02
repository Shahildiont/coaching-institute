const express = require("express");
const router = express.Router();

const {
  createQuestionPaper,
  getAllQuestionPapers,
  getQuestionPaperById,
  updateQuestionPaper,
  deleteQuestionPaper,
} = require("../controllers/questionPaperController");

// Create question paper
router.post("/", createQuestionPaper);

// Get all question papers
router.get("/", getAllQuestionPapers);

// Get single question paper
router.get("/:id", getQuestionPaperById);

// Update question paper
router.put("/:id", updateQuestionPaper);

// Delete question paper
router.delete("/:id", deleteQuestionPaper);

module.exports = router;