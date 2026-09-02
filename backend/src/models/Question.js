const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length === 4;
        },
        message: "Exactly 4 options are required",
      },
    },
    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: [true, "Correct answer is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [1, "Marks must be at least 1"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.post("save", async function () {
  const Quiz = mongoose.model("Quiz");
  const quizzes = await Quiz.find({ questions: this._id });

  for (const quiz of quizzes) {
    const questions = await mongoose
      .model("Question")
      .find({ _id: { $in: quiz.questions }, status: { $ne: "inactive" } });

    const totalQuestions = questions.length;
    const totalMarks = questions.reduce(
      (sum, question) => sum + (Number(question.marks) || 0),
      0
    );
    const duration = questions.reduce(
      (sum, question) => sum + (Number(question.duration) || 0),
      0
    );

    quiz.totalQuestions = totalQuestions;
    quiz.totalMarks = totalMarks;
    quiz.duration = duration;

    await quiz.save();
  }
});

module.exports = mongoose.model("Question", questionSchema);