const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Question paper title is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard" ,"mixed"],
      default: "easy",
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [0, "Total marks cannot be negative"],
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      default: 30,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuestionPaper", questionPaperSchema);