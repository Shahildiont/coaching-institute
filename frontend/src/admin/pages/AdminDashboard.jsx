import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { getAllUsers } from "../../services/userService";
import { getAllTeams } from "../../services/teamService";
import { getAllCategories } from "../../services/categoryService";
import { getAllQuestions } from "../../services/questionService";
import { getAllQuestionPapers } from "../../services/questionPaperService";
import { getAllQuizzes } from "../../services/quizService";

const toneClasses = {
  slate: "bg-slate-50 text-slate-900 ring-slate-200",
  blue: "bg-blue-50 text-blue-900 ring-blue-200",
  emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  purple: "bg-purple-50 text-purple-900 ring-purple-200",
  amber: "bg-amber-50 text-amber-900 ring-amber-200",
  rose: "bg-rose-50 text-rose-900 ring-rose-200",
  zinc: "bg-zinc-50 text-zinc-900 ring-zinc-200",
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function AnimatedCount({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = Number(value) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }
    const duration = 800;
    const step = 16;
    const inc = target / (duration / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= target) {
        setCount(target);
        clearInterval(t);
      } else {
        setCount(Math.floor(start));
      }
    }, step);
    return () => clearInterval(t);
  }, [value]);

  return <>{count}</>;
}

function StatCard({ title, value, tone = "slate", subtitle, index = 0 }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(15,23,42,0.08)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`rounded-3xl p-5 shadow-sm ring-1 ${toneClasses[tone] || toneClasses.slate}`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-70">
        {title}
      </p>
      <h3 className="mt-4 text-3xl font-bold">
        <AnimatedCount value={value} />
      </h3>
      {subtitle && <p className="mt-2 text-sm opacity-80">{subtitle}</p>}
    </motion.div>
  );
}

function SectionCard({ title, action, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </motion.div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function ProgressRow({ label, value, total, colorClass, delay = 0 }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboardData(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [
        usersResponse,
        teamsResponse,
        categoriesResponse,
        questionsResponse,
        papersResponse,
        quizzesResponse,
      ] = await Promise.all([
        getAllUsers().catch(() => ({ users: [] })),
        getAllTeams().catch(() => ({ teams: [] })),
        getAllCategories().catch(() => ({ categories: [] })),
        getAllQuestions().catch(() => ({ questions: [] })),
        getAllQuestionPapers().catch(() => ({ questionPapers: [] })),
        getAllQuizzes().catch(() => ({ quizzes: [] })),
      ]);

      setUsers(usersResponse?.users || []);
      setTeams(teamsResponse?.teams || []);
      setCategories(categoriesResponse?.categories || []);
      setQuestions(questionsResponse?.questions || []);
      setQuestionPapers(papersResponse?.questionPapers || []);
      setQuizzes(quizzesResponse?.quizzes || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalStaff = useMemo(() => users.filter((u) => u.role === "staff").length, [users]);
  const totalAdmins = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);
  const totalStudents = useMemo(() => users.filter((u) => u.role === "student").length, [users]);
  const activeQuestions = useMemo(() => questions.filter((q) => q.status === "active").length, [questions]);
  const draftQuestions = useMemo(() => questions.filter((q) => q.status === "draft").length, [questions]);
  const activeQuestionPapers = useMemo(() => questionPapers.filter((p) => p.status === "active").length, [questionPapers]);

  const recentUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    [users]
  );
  const recentQuestions = useMemo(
    () => [...questions].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    [questions]
  );
  const recentQuestionPapers = useMemo(
    () => [...questionPapers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    [questionPapers]
  );

  const difficultyStats = useMemo(
    () => ({
      easy: questions.filter((q) => q.difficulty === "easy").length,
      medium: questions.filter((q) => q.difficulty === "medium").length,
      hard: questions.filter((q) => q.difficulty === "hard").length,
    }),
    [questions]
  );

  const topCategories = useMemo(() => {
    const map = new Map();
    questions.forEach((question) => {
      const categoryName =
        typeof question.category === "object"
          ? question.category?.title || "Unknown"
          : question.category || "Unknown";
      map.set(categoryName, (map.get(categoryName) || 0) + 1);
    });
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [questions]);

  const quickActions = [
    { label: "Add User", to: "/admin/users" },
    { label: "Create Team", to: "/admin/teams" },
    { label: "Add Category", to: "/admin/categories" },
    { label: "Add Question", to: "/admin/questions" },
    { label: "Create Question Paper", to: "/admin/question-papers" },
    { label: "Create Quiz", to: "/admin/quizzes/new" },
  ];

  const stats = [
    { title: "Total Users", value: users.length, tone: "slate", subtitle: `${totalAdmins} admins` },
    { title: "Staff", value: totalStaff, tone: "blue", subtitle: "staffs" },
    { title: "Teams", value: teams.length, tone: "emerald", subtitle: "Active team records" },
    { title: "Categories", value: categories.length, tone: "purple", subtitle: "Available subjects/topics" },
    { title: "Questions", value: questions.length, tone: "amber", subtitle: `${activeQuestions} active` },
    { title: "Draft Questions", value: draftQuestions, tone: "rose", subtitle: "Need review or publish" },
    { title: "Question Papers", value: questionPapers.length, tone: "slate", subtitle: `${activeQuestionPapers} active` },
    { title: "Quizzes", value: quizzes.length, tone: "blue", subtitle: "Published and draft quizzes" },
  ];

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-600"
            />
            Loading dashboard data...
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.05 }}
              className="h-36 rounded-3xl bg-slate-200"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Overview of users, teams, questions, papers, and quizzes.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          type="button"
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <motion.svg
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </motion.svg>
          Refresh
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Quick Actions" className="xl:col-span-1">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Link
                  to={action.to}
                  className="flex h-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-6 text-center text-base font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  {action.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Question Difficulty" className="xl:col-span-1">
          <div className="space-y-4">
            <ProgressRow label="Easy" value={difficultyStats.easy} total={questions.length} colorClass="bg-emerald-500" delay={0} />
            <ProgressRow label="Medium" value={difficultyStats.medium} total={questions.length} colorClass="bg-amber-500" delay={0.1} />
            <ProgressRow label="Hard" value={difficultyStats.hard} total={questions.length} colorClass="bg-rose-500" delay={0.2} />
          </div>
        </SectionCard>

        <SectionCard title="Top Categories" className="xl:col-span-1">
          {topCategories.length === 0 ? (
            <EmptyState text="No category usage data available yet." />
          ) : (
            <div className="space-y-3">
              {topCategories.map((item, i) => (
                <ProgressRow
                  key={item.name}
                  label={item.name}
                  value={item.count}
                  total={topCategories[0]?.count || 1}
                  colorClass="bg-slate-900"
                  delay={i * 0.08}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Recent Users"
          action={
            <Link to="/admin/users" className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
              View all
            </Link>
          }
        >
          {recentUsers.length === 0 ? (
            <EmptyState text="No users found." />
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user, i) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name || user.fullName || "Unnamed User"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">{user.email || "No email"}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {user.role || "user"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Questions"
          action={
            <Link to="/admin/questions" className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
              View all
            </Link>
          }
        >
          {recentQuestions.length === 0 ? (
            <EmptyState text="No questions found." />
          ) : (
            <div className="space-y-3">
              {recentQuestions.map((question, i) => (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">{question.questionText}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {question.category?.title || "Unknown"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{question.difficulty}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">{question.marks} marks</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Question Papers"
          action={
            <Link to="/admin/question-papers" className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
              View all
            </Link>
          }
        >
          {recentQuestionPapers.length === 0 ? (
            <EmptyState text="No question papers found." />
          ) : (
            <div className="space-y-3">
              {recentQuestionPapers.map((paper, i) => (
                <motion.div
                  key={paper._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">{paper.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {typeof paper.category === "object" ? paper.category?.title || "-" : paper.category || "-"}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">{paper.duration || 0} mins</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">{paper.totalMarks || 0} marks</span>
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-700">
                      {paper.questions?.length || 0} questions
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}

export default AdminDashboard;