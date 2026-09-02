const mongoose = require("mongoose");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const Category = require("../models/Category");
const XLSX = require("xlsx");
const csv = require("csv-parser");
const { Readable } = require("stream");

async function recalculateQuizStatsByQuestionId(questionId) {
  const quizzes = await Quiz.find({ questions: questionId });

  for (const quiz of quizzes) {
    const questions = await Question.find({
      _id: { $in: quiz.questions },
      status: { $ne: "inactive" },
    });

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
}

exports.getAllQuestions = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    const filter = {};

    if (!isAdmin && !isStaff) {
      filter.status = "active";
    }

    if (req.query.category) {
      filter.category = req.query.category.trim();
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty.trim().toLowerCase();
    }

    if (req.query.status && (isAdmin || isStaff)) {
      filter.status = req.query.status.trim().toLowerCase();
    }

    if (req.query.search) {
      filter.questionText = {
        $regex: req.query.search.trim(),
        $options: "i",
      };
    }

    const questions = await Question.find(filter)
      .populate("category", "title")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions",
    });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }

    const question = await Question.findById(id)
      .populate("category", "title")
      .populate("createdBy", "name email");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (!isAdmin && !isStaff && question.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch question",
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    if (!isAdmin && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can create questions",
      });
    }

    const question = await Question.create({
      questionText: req.body.questionText,
      category: req.body.category,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      difficulty: req.body.difficulty,
      marks: req.body.marks,
      duration: req.body.duration,
      explanation: req.body.explanation,
      status: req.body.status,
      createdBy: req.user?._id || null,
    });

    const populated = await Question.findById(question._id)
      .populate("category", "title")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: populated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create question",
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    if (!isAdmin && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can update questions",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }

    const updatePayload = {
      questionText: req.body.questionText,
      category: req.body.category,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      difficulty: req.body.difficulty,
      marks: req.body.marks,
      duration: req.body.duration,
      explanation: req.body.explanation,
      status: req.body.status,
    };

    const question = await Question.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category", "title")
      .populate("createdBy", "name email");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await recalculateQuizStatsByQuestionId(id);

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update question",
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === "admin";
    const isStaff = req.user && req.user.role === "staff";

    if (!isAdmin && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "Only admin and staff can delete questions",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question id",
      });
    }

    const quizzes = await Quiz.find({ questions: id });

    for (const quiz of quizzes) {
      quiz.questions = quiz.questions.filter(
        (questionId) => questionId.toString() !== id
      );

      const remainingQuestions = await Question.find({
        _id: { $in: quiz.questions },
        status: { $ne: "inactive" },
      });

      quiz.totalQuestions = remainingQuestions.length;
      quiz.totalMarks = remainingQuestions.reduce(
        (sum, question) => sum + (Number(question.marks) || 0),
        0
      );
      quiz.duration = remainingQuestions.reduce(
        (sum, question) => sum + (Number(question.duration) || 0),
        0
      );

      await quiz.save();
    }

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete question",
    });
  }
};



const REQUIRED_COLUMNS = [
  "questionText",
  "category",
  "difficulty",
  "marks",
  "duration",
  "options",
  "correctAnswer",
];

function validateRow(row, rowIndex) {
  const errors = [];

  if (!row.questionText || !String(row.questionText).trim()) {
    errors.push("Question text is required");
  }

  if (!row.category) {
    errors.push("Category is required");
  }

  const difficulty = String(row.difficulty)?.toLowerCase();
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    errors.push("Difficulty must be easy, medium, or hard");
  }

  const marks = Number(row.marks);
  if (!marks || marks <= 0) {
    errors.push("Marks must be a positive number");
  }

  const duration = Number(row.duration);
  if (!duration || duration <= 0) {
    errors.push("Duration must be a positive number");
  }

let options;
try {
  options = typeof row.options === "string" ? JSON.parse(row.options) : row.options;

  if (!Array.isArray(options) || options.length !== 4) {
    errors.push("Options must be an array of exactly 4 items");
  }

  const hasInvalidOption = Array.isArray(options)
    ? options.some((opt) => typeof opt !== "string" || !String(opt).trim())
    : true;

  if (Array.isArray(options) && hasInvalidOption) {
    errors.push("All options must be non-empty strings");
  }
} catch {
  errors.push("Options must be a valid JSON array");
}

const correctAnswer = String(row.correctAnswer || "").trim().toUpperCase();
if (!["A", "B", "C", "D"].includes(correctAnswer)) {
  errors.push("Correct answer must be A, B, C, or D");
}

  return {
    valid: errors.length === 0,
    errors,
    row,
    rowIndex,
  };
}

async function mapCategoryToId(categoryValue) {
  if (!categoryValue) {
    throw new Error("Category value is empty");
  }

  if (mongoose.Types.ObjectId.isValid(String(categoryValue))) {
    const exists = await Category.findById(categoryValue);
    if (!exists) {
      throw new Error(`Category with ID "${categoryValue}" not found`);
    }
    return categoryValue;
  }

  const categoryDoc = await Category.findOne({
    title: { $regex: new RegExp(`^${String(categoryValue).trim()}$`, "i") },
  });

  if (!categoryDoc) {
    throw new Error(`Category "${categoryValue}" not found in database. Create it first.`);
  }

  return categoryDoc._id;
}

function parseOptions(optionsRaw) {
  let parsed;

  if (Array.isArray(optionsRaw)) {
    parsed = optionsRaw;
  } else if (typeof optionsRaw === "string") {
    try {
      parsed = JSON.parse(optionsRaw);
    } catch {
      throw new Error("Options must be a valid JSON array");
    }
  } else {
    throw new Error("Options must be a valid JSON array");
  }

  if (!Array.isArray(parsed) || parsed.length !== 4) {
    throw new Error("Options must contain exactly 4 items");
  }

  const optionKeys = ["A", "B", "C", "D"];

  return parsed.map((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`Option ${optionKeys[index]} must be a non-empty string`);
    }

    return {
      key: optionKeys[index],
      text: item.trim(),
    };
  });
}

async function processQuestionsFromRows(rows) {
  const results = {
    totalRows: rows.length,
    validCount: 0,
    invalidCount: 0,
    createdCount: 0,
    errors: [],
  };

  const validQuestions = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2;

    const validation = validateRow(row, rowIndex);

    if (!validation.valid) {
      results.invalidCount++;
      results.errors.push({
        row: rowIndex,
        questionText: row.questionText || "",
        errors: validation.errors,
      });
      continue;
    }

    try {
      const categoryId = await mapCategoryToId(row.category);
      const options = parseOptions(row.options);

      const correctAnswer = String(row.correctAnswer).trim().toUpperCase();

      const questionDoc = {
        questionText: String(row.questionText).trim(),
        category: categoryId,
        difficulty: String(row.difficulty).toLowerCase(),
        marks: Number(row.marks),
        duration: Number(row.duration),
        options,
        correctAnswer,
        explanation: row.explanation ? String(row.explanation).trim() : "",
        status: row.status ? String(row.status).toLowerCase() : "active",
      };

      validQuestions.push(questionDoc);
      results.validCount++;
    } catch (err) {
      results.invalidCount++;
      results.errors.push({
        row: rowIndex,
        questionText: row.questionText || "",
        errors: [err.message || "Failed to process row"],
      });
    }
  }

  console.log("[BULK UPLOAD] Valid questions to insert:", validQuestions.length);

  if (validQuestions.length > 0) {
    try {
      const created = await Question.insertMany(validQuestions, { ordered: false });
      results.createdCount = created.length;
      console.log("[BULK UPLOAD] Created questions:", created.length);
    } catch (insertErr) {
      console.error("[BULK UPLOAD] Insert error:", insertErr);
      results.errors.push({
        row: 0,
        questionText: "Bulk insert failed",
        errors: [insertErr.message || "Database insert failed"],
      });
    }
  } else {
    console.log("[BULK UPLOAD] No valid questions to insert.");
  }

  return results;
}

async function parseExcelFile(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Excel file must have at least one row of data");
  }

  const firstRow = rows[0];
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !(col in firstRow)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(", ")}`
    );
  }

  return rows;
}

function parseCSVFile(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    let headersValidated = false;

    const stream = Readable.from(buffer);
    stream
      .pipe(csv())
      .on("headers", (headers) => {
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          reject(
            new Error(
              `Missing required columns: ${missingColumns.join(", ")}`
            )
          );
        }
        headersValidated = true;
      })
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        if (!headersValidated || results.length === 0) {
          reject(new Error("CSV file must have headers and at least one row"));
        } else {
          resolve(results);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

exports.bulkUploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.file;
    const isExcel =
      file.mimetype ===
        "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const isCSV = file.mimetype === "text/csv";

    let rows;

    if (isExcel) {
      rows = await parseExcelFile(file.buffer);
    } else if (isCSV) {
      rows = await parseCSVFile(file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });
    }

    const results = await processQuestionsFromRows(rows);

    if (results.createdCount === 0 && results.invalidCount > 0) {
      return res.status(400).json({
        success: false,
        message: "No valid questions to import",
        details: results,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${results.createdCount} questions imported successfully`,
      details: results,
    });
  } catch (error) {
    console.error("[BULK UPLOAD] Top-level error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process file",
    });
  }
};