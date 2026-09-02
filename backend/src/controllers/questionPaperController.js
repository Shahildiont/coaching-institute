const mongoose = require("mongoose");
const QuestionPaper = require("../models/QuestionPaper");
const Question = require("../models/Question");

function buildQuestionPaperQuery(queryParams) {
  const { search, category, difficulty, status } = queryParams;
  const query = {};

  if (search && search.trim()) {
    query.title = { $regex: search.trim(), $options: "i" };
  }

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = category;
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (status) {
    query.status = status;
  }

  return query;
}

function validateQuestionIds(questionIds = []) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return "At least one question is required";
  }

  const hasInvalidId = questionIds.some(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (hasInvalidId) {
    return "One or more question IDs are invalid";
  }

  return null;
}

async function createQuestionPaper(req, res) {
  try {
    const {
      title,
      category,
      difficulty,
      totalMarks,
      duration,
      questions,
      status,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and category are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const questionValidationError = validateQuestionIds(questions);
    if (questionValidationError) {
      return res.status(400).json({
        success: false,
        message: questionValidationError,
      });
    }

    const existingQuestions = await Question.countDocuments({
      _id: { $in: questions },
    });

    if (existingQuestions !== questions.length) {
      return res.status(400).json({
        success: false,
        message: "Some selected questions do not exist",
      });
    }

    const questionPaper = await QuestionPaper.create({
      title,
      category,
      difficulty,
      totalMarks,
      duration,
      questions,
      status,
    });

    const populatedPaper = await QuestionPaper.findById(questionPaper._id)
      .populate("category", "title status")
      .populate(
        "questions",
        "questionText category difficulty marks duration status"
      );

    return res.status(201).json({
      success: true,
      message: "Question paper created successfully",
      questionPaper: populatedPaper,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create question paper",
    });
  }
}

async function getAllQuestionPapers(req, res) {
  try {
    const query = buildQuestionPaperQuery(req.query);

    const questionPapers = await QuestionPaper.find(query)
      .populate("category", "title status")
      .populate(
        "questions",
        "questionText category difficulty marks duration status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questionPapers.length,
      questionPapers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch question papers",
    });
  }
}

async function getQuestionPaperById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID",
      });
    }

    const questionPaper = await QuestionPaper.findById(id)
      .populate("category", "title status")
      .populate(
        "questions",
        "questionText options correctAnswer category difficulty marks duration explanation status"
      );

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      questionPaper,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch question paper",
    });
  }
}

async function updateQuestionPaper(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      difficulty,
      totalMarks,
      duration,
      questions,
      status,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID",
      });
    }

    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (questions) {
      const questionValidationError = validateQuestionIds(questions);
      if (questionValidationError) {
        return res.status(400).json({
          success: false,
          message: questionValidationError,
        });
      }

      const existingQuestions = await Question.countDocuments({
        _id: { $in: questions },
      });

      if (existingQuestions !== questions.length) {
        return res.status(400).json({
          success: false,
          message: "Some selected questions do not exist",
        });
      }
    }

    const updatedPaper = await QuestionPaper.findByIdAndUpdate(
      id,
      {
        title,
        category,
        difficulty,
        totalMarks,
        duration,
        questions,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category", "title status")
      .populate(
        "questions",
        "questionText category difficulty marks duration status"
      );

    if (!updatedPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question paper updated successfully",
      questionPaper: updatedPaper,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update question paper",
    });
  }
}

async function deleteQuestionPaper(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID",
      });
    }

    const deletedPaper = await QuestionPaper.findByIdAndDelete(id);

    if (!deletedPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question paper deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete question paper",
    });
  }
}

module.exports = {
  createQuestionPaper,
  getAllQuestionPapers,
  getQuestionPaperById,
  updateQuestionPaper,
  deleteQuestionPaper,
};