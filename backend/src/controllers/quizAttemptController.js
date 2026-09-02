const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Coupon = require("../models/Coupon");
const QuizAttempt = require("../models/QuizAttempt");

async function findAssignedCoupon(percentage) {
  const now = new Date();

  const coupon = await Coupon.findOne({
    status: "active",
    minPercentage: { $lte: percentage },
    maxPercentage: { $gte: percentage },
    $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
  }).sort({ minPercentage: -1, createdAt: -1 });

  return coupon;
}

exports.submitQuizAttempt = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { quizId } = req.params;
    const { answers = [], timeSpentSeconds = 0, status = "submitted" } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid test id",
      });
    }

    const quiz = await Quiz.findById(quizId).populate({
      path: "questionPaper",
      populate: {
        path: "questions",
        match: { status: "active" },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (quiz.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This test is not available",
      });
    }

    const questions = Array.isArray(quiz.questionPaper?.questions)
      ? quiz.questionPaper.questions
      : [];

    const questionMap = new Map(
      questions.map((question) => [question._id.toString(), question])
    );

    const submittedAnswerMap = new Map();

    for (const item of answers) {
      const questionId = item?.question;
      const selectedAnswerRaw = item?.selectedAnswer || "";

      if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
        continue;
      }

      const matchedQuestion = questionMap.get(questionId.toString());

      if (!matchedQuestion) {
        continue;
      }

      const normalizedSelectedAnswer =
        typeof selectedAnswerRaw === "string"
          ? selectedAnswerRaw.trim().toUpperCase()
          : "";

      submittedAnswerMap.set(questionId.toString(), normalizedSelectedAnswer);
    }

    const sanitizedAnswers = [];
    let answeredQuestions = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let scoredMarks = 0;
    let totalMarks = 0;

    for (const question of questions) {
      const questionId = question._id.toString();
      const selectedAnswer = submittedAnswerMap.get(questionId) || "";
      const hasAnswer = ["A", "B", "C", "D"].includes(selectedAnswer);
      const normalizedCorrectAnswer =
        typeof question.correctAnswer === "string"
          ? question.correctAnswer.trim().toUpperCase()
          : "";
      const questionMarks = Number(question.marks || 0);
      const isCorrect = hasAnswer && selectedAnswer === normalizedCorrectAnswer;
      const marksAwarded = isCorrect ? questionMarks : 0;

      totalMarks += questionMarks;

      if (hasAnswer) {
        answeredQuestions += 1;
      }

      if (isCorrect) {
        correctAnswers += 1;
        scoredMarks += marksAwarded;
      } else if (hasAnswer) {
        wrongAnswers += 1;
      }

      sanitizedAnswers.push({
        question: question._id,
        selectedAnswer: hasAnswer ? selectedAnswer : "",
        isCorrect,
        marksAwarded,
      });
    }

    const totalQuestions = questions.length;
    const unansweredQuestions = totalQuestions - answeredQuestions;
    const percentage =
      totalMarks > 0 ? Number(((scoredMarks / totalMarks) * 100).toFixed(2)) : 0;

    const matchedCoupon = await findAssignedCoupon(percentage);
    const safeTimeSpentSeconds = Math.max(Number(timeSpentSeconds || 0), 0);

    const attempt = await QuizAttempt.create({
      user: userId,
      quiz: quiz._id,
      answers: sanitizedAnswers,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions,
      totalMarks,
      scoredMarks,
      percentage,
      assignedCoupon: matchedCoupon ? matchedCoupon._id : null,
      startedAt: new Date(Date.now() - safeTimeSpentSeconds * 1000),
      submittedAt: new Date(),
      timeSpentSeconds: safeTimeSpentSeconds,
      status: status === "time_up" ? "time_up" : "submitted",
    });

    const populatedAttempt = await QuizAttempt.findById(attempt._id)
      .populate("quiz", "title examType duration totalMarks totalQuestions")
      .populate(
        "assignedCoupon",
        "title code minPercentage maxPercentage discountType discountValue expiryDate status description"
      );

    return res.status(201).json({
      success: true,
      message:
        status === "time_up"
          ? "Time is up. Test submitted automatically"
          : "Test submitted successfully",
      attempt: populatedAttempt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit test",
    });
  }
};

exports.getMyAttemptById = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt id",
      });
    }

    const attempt = await QuizAttempt.findOne({
      _id: id,
      user: userId,
    })
      .populate("quiz", "title examType duration totalMarks totalQuestions")
      .populate(
        "answers.question",
        "questionText options correctAnswer marks duration difficulty explanation category"
      )
      .populate(
        "assignedCoupon",
        "title code minPercentage maxPercentage discountType discountValue expiryDate status description"
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    return res.status(200).json({
      success: true,
      attempt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch attempt",
    });
  }
};