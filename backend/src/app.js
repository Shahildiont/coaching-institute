const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const couponRoutes = require("./routes/couponRoutes");
const questionRoutes = require("./routes/questionRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const roleRoutes = require("./routes/roleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const questionPaperRoutes = require("./routes/questionPaperRoutes");
const { protect } = require("./middleware/authMiddleware");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "coaching-institute-steel.vercel.app/api",
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api", quizAttemptRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/question-papers", questionPaperRoutes);

module.exports = app;