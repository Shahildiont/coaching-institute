const mongoose = require("mongoose");
const School = require("../models/School");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

exports.createSchool = async (req, res) => {
  try {
    const school = await School.create({
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      status: req.body.status,
    });

    return res.status(201).json({
      success: true,
      message: "School created successfully",
      school,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create school",
    });
  }
};

exports.getAllSchools = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";
    const filter = isAdmin || isStaff ? {} : { status: "active" };

    const schools = await School.find(filter).sort({ createdAt: -1 }).lean();

    const schoolsWithStats = await Promise.all(
      schools.map(async (school) => {
        const quizzes = await Quiz.find({ school: school._id }).select("_id status totalMarks totalQuestions");
        const quizIds = quizzes.map((quiz) => quiz._id);

        const attempts = await QuizAttempt.find({
          quiz: { $in: quizIds },
        }).select(
          "user percentage scoredMarks totalMarks correctAnswers wrongAnswers unansweredQuestions assignedCoupon createdAt"
        );

        const totalQuizzes = quizzes.length;
        const activeQuizzes = quizzes.filter((quiz) => quiz.status === "active").length;
        const totalAttempts = attempts.length;
        const uniqueStudentsAttempted = new Set(
          attempts.map((attempt) => String(attempt.user))
        ).size;
        const totalCouponsAssigned = attempts.filter(
          (attempt) => attempt.assignedCoupon
        ).length;

        const averagePercentage = totalAttempts
          ? Number(
              (
                attempts.reduce(
                  (sum, attempt) => sum + Number(attempt.percentage || 0),
                  0
                ) / totalAttempts
              ).toFixed(2)
            )
          : 0;

        const averageScore = totalAttempts
          ? Number(
              (
                attempts.reduce(
                  (sum, attempt) => sum + Number(attempt.scoredMarks || 0),
                  0
                ) / totalAttempts
              ).toFixed(2)
            )
          : 0;

        return {
          ...school,
          stats: {
            totalQuizzes,
            activeQuizzes,
            totalAttempts,
            uniqueStudentsAttempted,
            averagePercentage,
            averageScore,
            totalCouponsAssigned,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: schoolsWithStats.length,
      schools: schoolsWithStats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch schools",
    });
  }
};

exports.getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const school = await School.findById(id).lean();

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    if (!isAdmin && !isStaff && school.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const quizzes = await Quiz.find({ school: id })
      .populate("teams", "name status")
      .populate("questionPaper", "title category")
      .sort({ createdAt: -1 })
      .lean();

    const quizIds = quizzes.map((quiz) => quiz._id);

    const attempts = await QuizAttempt.find({
      quiz: { $in: quizIds },
    })
      .populate("user", "name email role")
      .populate("quiz", "title examType totalMarks totalQuestions")
      .populate("assignedCoupon", "title code discountType discountValue")
      .sort({ createdAt: -1 })
      .lean();

    const totalQuizzes = quizzes.length;
    const activeQuizzes = quizzes.filter((quiz) => quiz.status === "active").length;
    const draftQuizzes = quizzes.filter((quiz) => quiz.status === "draft").length;
    const inactiveQuizzes = quizzes.filter((quiz) => quiz.status === "inactive").length;

    const totalAttempts = attempts.length;
    const uniqueStudentsAttempted = new Set(
      attempts.map((attempt) => String(attempt.user?._id || attempt.user))
    ).size;

    const totalCouponsAssigned = attempts.filter(
      (attempt) => attempt.assignedCoupon
    ).length;

    const averagePercentage = totalAttempts
      ? Number(
          (
            attempts.reduce(
              (sum, attempt) => sum + Number(attempt.percentage || 0),
              0
            ) / totalAttempts
          ).toFixed(2)
        )
      : 0;

    const averageScore = totalAttempts
      ? Number(
          (
            attempts.reduce(
              (sum, attempt) => sum + Number(attempt.scoredMarks || 0),
              0
            ) / totalAttempts
          ).toFixed(2)
        )
      : 0;

    const averageTimeSpentSeconds = totalAttempts
      ? Number(
          (
            attempts.reduce(
              (sum, attempt) => sum + Number(attempt.timeSpentSeconds || 0),
              0
            ) / totalAttempts
          ).toFixed(2)
        )
      : 0;

    const passRate = totalAttempts
      ? Number(
          (
            (attempts.filter((attempt) => Number(attempt.percentage || 0) >= 40).length /
              totalAttempts) *
            100
          ).toFixed(2)
        )
      : 0;

    const recentAttempts = attempts.slice(0, 10);

    const studentPerformanceMap = new Map();

    for (const attempt of attempts) {
      const userId = String(attempt.user?._id || "");
      if (!userId) continue;

      if (!studentPerformanceMap.has(userId)) {
        studentPerformanceMap.set(userId, {
          user: attempt.user,
          totalAttempts: 0,
          totalPercentage: 0,
          totalScoredMarks: 0,
          totalCorrectAnswers: 0,
        });
      }

      const entry = studentPerformanceMap.get(userId);
      entry.totalAttempts += 1;
      entry.totalPercentage += Number(attempt.percentage || 0);
      entry.totalScoredMarks += Number(attempt.scoredMarks || 0);
      entry.totalCorrectAnswers += Number(attempt.correctAnswers || 0);
    }

    const studentPerformance = Array.from(studentPerformanceMap.values())
      .map((entry) => ({
        ...entry,
        averagePercentage: Number(
          (entry.totalPercentage / entry.totalAttempts).toFixed(2)
        ),
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage);

    const topStudents = studentPerformance.slice(0, 5);
    const lowPerformers = [...studentPerformance]
      .sort((a, b) => a.averagePercentage - b.averagePercentage)
      .slice(0, 5);

    const quizPerformanceMap = new Map();

    for (const attempt of attempts) {
      const quizId = String(attempt.quiz?._id || "");
      if (!quizId) continue;

      if (!quizPerformanceMap.has(quizId)) {
        quizPerformanceMap.set(quizId, {
          quiz: attempt.quiz,
          totalAttempts: 0,
          totalPercentage: 0,
          totalScoredMarks: 0,
        });
      }

      const entry = quizPerformanceMap.get(quizId);
      entry.totalAttempts += 1;
      entry.totalPercentage += Number(attempt.percentage || 0);
      entry.totalScoredMarks += Number(attempt.scoredMarks || 0);
    }

    const quizPerformance = Array.from(quizPerformanceMap.values())
      .map((entry) => ({
        ...entry,
        averagePercentage: Number(
          (entry.totalPercentage / entry.totalAttempts).toFixed(2)
        ),
      }))
      .sort((a, b) => b.totalAttempts - a.totalAttempts);

    return res.status(200).json({
      success: true,
      school,
      stats: {
        totalQuizzes,
        activeQuizzes,
        draftQuizzes,
        inactiveQuizzes,
        totalAttempts,
        uniqueStudentsAttempted,
        averagePercentage,
        averageScore,
        averageTimeSpentSeconds,
        passRate,
        totalCouponsAssigned,
      },
      quizzes,
      recentAttempts,
      studentPerformance,
      topStudents,
      lowPerformers,
      quizPerformance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch school",
    });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const school = await School.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        status: req.body.status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School updated successfully",
      school,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update school",
    });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const school = await School.findByIdAndDelete(id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete school",
    });
  }
};