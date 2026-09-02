const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

const updateQuizStats = async (quizId) => {
  const questions = await Question.find({ quiz: quizId });

  const totalQuestions = questions.length;
  const totalMarks = questions.reduce(
    (sum, question) => sum + (Number(question.marks) || 0),
    0
  );
  const duration = questions.reduce(
    (sum, question) => sum + (Number(question.duration) || 0),
    0
  );

  await Quiz.findByIdAndUpdate(
    quizId,
    {
      totalQuestions,
      totalMarks,
      duration,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

module.exports = updateQuizStats;