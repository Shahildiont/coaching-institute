const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const School = require("../models/School");
const Team = require("../models/Team");
const QuestionPaper = require("../models/QuestionPaper");

async function buildQuizStats(questionPaperId) {
  if (!mongoose.Types.ObjectId.isValid(questionPaperId)) {
    throw new Error("Invalid question paper id");
  }

  const questionPaper = await QuestionPaper.findById(questionPaperId).populate({
    path: "questions",
    select: "marks duration status",
  });

  if (!questionPaper) {
    throw new Error("Question paper not found");
  }

  const activeQuestions = (questionPaper.questions || []).filter(
    (question) => question.status !== "inactive"
  );

  const totalQuestions = activeQuestions.length;
  const totalMarks = activeQuestions.reduce(
    (sum, question) => sum + (Number(question.marks) || 0),
    0
  );
  const duration = activeQuestions.reduce(
    (sum, question) => sum + (Number(question.duration) || 0),
    0
  );

  return {
    totalQuestions,
    totalMarks,
    duration,
    questionPaper,
  };
}

async function getValidTeamIds(teamIds = []) {
  const validTeamIds = [...new Set((teamIds || []).map(String))].filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (validTeamIds.length === 0) {
    return [];
  }

  const existingTeams = await Team.find({
    _id: { $in: validTeamIds },
  }).select("_id");

  return existingTeams.map((team) => team._id);
}

exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      school,
      examType,
      status,
      description,
      questionPaper,
      teams = [],
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(school)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(questionPaper)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper id",
      });
    }

    const schoolDoc = await School.findById(school);

    if (!schoolDoc) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const validTeamIds = await getValidTeamIds(teams);
    const stats = await buildQuizStats(questionPaper);

    const quiz = await Quiz.create({
      title,
      school,
      examType,
      status,
      description,
      questionPaper,
      teams: validTeamIds,
      duration: stats.duration,
      totalMarks: stats.totalMarks,
      totalQuestions: stats.totalQuestions,
    });

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate("school")
      .populate({
        path: "questionPaper",
        populate: [
          {
            path: "category",
            select: "title",
          },
          {
            path: "questions",
            populate: {
              path: "category",
              select: "title",
            },
          },
        ],
      })
      .populate("teams", "name description status");

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: populatedQuiz,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create quiz",
    });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    const filter = isAdmin || isStaff ? {} : { status: "active" };

    if (req.query.school && mongoose.Types.ObjectId.isValid(req.query.school)) {
      filter.school = req.query.school;
    }

    if (req.query.status && (isAdmin || isStaff)) {
      filter.status = req.query.status.trim().toLowerCase();
    }

    const quizzes = await Quiz.find(filter)
      .populate("school")
      .populate("teams", "name description status")
      .populate({
        path: "questionPaper",
        populate: {
          path: "category",
          select: "title",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quizzes",
    });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }

    const quiz = await Quiz.findById(id)
      .populate("school")
      .populate("teams", "name description status")
      .populate({
        path: "questionPaper",
        populate: [
          {
            path: "category",
            select: "title",
          },
          {
            path: "questions",
            populate: {
              path: "category",
              select: "title",
            },
          },
        ],
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!isAdmin && !isStaff && quiz.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quiz",
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      school,
      examType,
      status,
      description,
      questionPaper,
      teams = [],
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(school)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(questionPaper)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper id",
      });
    }

    const schoolDoc = await School.findById(school);

    if (!schoolDoc) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const validTeamIds = await getValidTeamIds(teams);
    const stats = await buildQuizStats(questionPaper);

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        school,
        examType,
        status,
        description,
        questionPaper,
        teams: validTeamIds,
        duration: stats.duration,
        totalMarks: stats.totalMarks,
        totalQuestions: stats.totalQuestions,
      },
      { new: true, runValidators: true }
    )
      .populate("school")
      .populate("teams", "name description status")
      .populate({
        path: "questionPaper",
        populate: [
          {
            path: "category",
            select: "title",
          },
          {
            path: "questions",
            populate: {
              path: "category",
              select: "title",
            },
          },
        ],
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update quiz",
    });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz id",
      });
    }

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete quiz",
    });
  }
};