import { useEffect, useMemo, useState } from "react";
import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  updateQuestion,
} from "../../services/questionService";
import { getAllCategories } from "../../services/categoryService";
import BulkQuestionUploadModal from "../components/BulkQuestionUploadModal";

const initialForm = {
  questionText: "",
  category: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  difficulty: "easy",
  marks: 1,
  duration: 1,
  explanation: "",
  status: "active",
};

const ITEMS_PER_PAGE = 5;

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  async function loadCategories() {
    try {
      setCategoryLoading(true);
      const data = await getAllCategories({ status: "active" });
      setCategoryOptions(data.categories || []);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  }

  async function loadQuestions() {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await getAllQuestions(params);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadQuestions();
    setCurrentPage(1);
  }, [search, categoryFilter, difficultyFilter, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        questionText: formData.questionText,
        category: formData.category,
        options: [
          { key: "A", text: formData.optionA },
          { key: "B", text: formData.optionB },
          { key: "C", text: formData.optionC },
          { key: "D", text: formData.optionD },
        ],
        correctAnswer: formData.correctAnswer,
        difficulty: formData.difficulty,
        marks: Number(formData.marks),
        duration: Number(formData.duration),
        explanation: formData.explanation,
        status: formData.status,
      };

      if (editingId) {
        await updateQuestion(editingId, payload);
      } else {
        await createQuestion(payload);
      }

      await loadQuestions();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(question) {
    setEditingId(question._id);
    setFormData({
      questionText: question.questionText || "",
      category:
        typeof question.category === "object"
          ? question.category?._id || ""
          : question.category || "",
      optionA: question.options?.find((opt) => opt.key === "A")?.text || "",
      optionB: question.options?.find((opt) => opt.key === "B")?.text || "",
      optionC: question.options?.find((opt) => opt.key === "C")?.text || "",
      optionD: question.options?.find((opt) => opt.key === "D")?.text || "",
      correctAnswer: question.correctAnswer || "A",
      difficulty: question.difficulty || "easy",
      marks: question.marks || 1,
      duration: question.duration || 1,
      explanation: question.explanation || "",
      status: question.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(questionId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(questionId);
      await deleteQuestion(questionId);
      await loadQuestions();
    } catch (err) {
      alert(err.message || "Failed to delete question");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkUploadSuccess() {
  await loadQuestions();
}

  const categories = useMemo(() => {
    return [...categoryOptions].sort((a, b) => a.title.localeCompare(b.title));
  }, [categoryOptions]);

  const totalPages = Math.max(1, Math.ceil(questions.length / ITEMS_PER_PAGE));

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return questions.slice(startIndex, endIndex);
  }, [questions, currentPage]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Panel
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Questions page
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Note : Create reusable questions by category and difficulty for quizzes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Bulk Upload
          </button>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Question" : "Add Question"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Question
              </label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                rows="4"
                placeholder="Enter question"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
                disabled={categoryLoading}
              >
                <option value="">
                  {categoryLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Option A
              </label>
              <input
                type="text"
                name="optionA"
                value={formData.optionA}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Option B
              </label>
              <input
                type="text"
                name="optionB"
                value={formData.optionB}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Option C
              </label>
              <input
                type="text"
                name="optionC"
                value={formData.optionC}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Option D
              </label>
              <input
                type="text"
                name="optionD"
                value={formData.optionD}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correct Answer
              </label>
              <select
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Marks
              </label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                min="1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Explanation
              </label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                rows="3"
                placeholder="Optional explanation"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>

            {error && (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || categoryLoading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update Question" : "Add Question"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-slate-900">Question List</h2>

            <div className="grid w-full gap-3 md:max-w-4xl md:grid-cols-4">
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-slate-500">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
              No questions found.
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {paginatedQuestions.map((question, index) => {
                  const categoryTitle =
                    typeof question.category === "object"
                      ? question.category?.title || "-"
                      : question.category || "-";

                  return (
                    <div
                      key={question._id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-500">
                            Question {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </p>

                          <h3 className="mt-2 text-base font-semibold text-slate-900">
                            {question.questionText}
                          </h3>

                          <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                            {question.options?.map((option) => (
                              <div
                                key={option.key}
                                className={`rounded-xl px-3 py-2 ${
                                  question.correctAnswer === option.key
                                    ? "bg-green-50 text-green-700"
                                    : "bg-slate-50"
                                }`}
                              >
                                <span className="font-semibold">{option.key}:</span>{" "}
                                {option.text}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                              {categoryTitle}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                              {question.difficulty}
                            </span>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                              {question.marks} marks
                            </span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                              {question.duration} mins
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                              Answer: {question.correctAnswer}
                            </span>
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                              {question.status}
                            </span>
                          </div>

                          {question.explanation && (
                            <p className="mt-4 text-sm text-slate-600">
                              <span className="font-semibold">Explanation:</span>{" "}
                              {question.explanation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(question)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(question._id)}
                            disabled={deletingId === question._id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === question._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {questions.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * ITEMS_PER_PAGE, questions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">{questions.length}</span>{" "}
                  questions
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        currentPage === page
                          ? "bg-slate-900 text-white"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <BulkQuestionUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </>
  );
}

export default Questions;