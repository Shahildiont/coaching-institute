import { useEffect, useMemo, useState } from "react";
import {
  createQuestionPaper,
  deleteQuestionPaper,
  getAllQuestionPapers,
  updateQuestionPaper,
} from "../../services/questionPaperService";
import { getAllQuestions } from "../../services/questionService";
import { getAllCategories } from "../../services/categoryService";

const createEmptyBlueprintRow = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  category: "",
  totalQuestions: 10,
  easyPercentage: 30,
  mediumPercentage: 50,
  hardPercentage: 20,
});

const initialForm = {
  id: null,
  title: "",
  status: "active",
  blueprintRows: [createEmptyBlueprintRow()],
  questions: [],
};

const ITEMS_PER_PAGE = 5;
const QUESTIONS_PER_PAGE = 6;

function shuffleArray(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function QuestionPapers() {
  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [generationWarnings, setGenerationWarnings] = useState([]);

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
      setQuestionsLoading(true);
      const data = await getAllQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message || "Failed to load questions");
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function loadPapers() {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (statusFilter) params.status = statusFilter;

      const data = await getAllQuestionPapers(params);
      setPapers(data.questionPapers || []);
    } catch (err) {
      setError(err.message || "Failed to load question papers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadQuestions();
  }, []);

  useEffect(() => {
    loadPapers();
    setCurrentPage(1);
  }, [search, categoryFilter, difficultyFilter, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleBlueprintRowChange(rowId, field, value) {
    setFormData((prev) => ({
      ...prev,
      blueprintRows: prev.blueprintRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]:
                field === "category"
                  ? value
                  : value === ""
                  ? ""
                  : Number(value),
            }
          : row
      ),
    }));
  }

  function addBlueprintRow() {
    setFormData((prev) => ({
      ...prev,
      blueprintRows: [...prev.blueprintRows, createEmptyBlueprintRow()],
    }));
  }

  function removeBlueprintRow(rowId) {
    setFormData((prev) => {
      if (prev.blueprintRows.length === 1) return prev;
      return {
        ...prev,
        blueprintRows: prev.blueprintRows.filter((row) => row.id !== rowId),
      };
    });
  }

  function resetForm() {
    setFormData({
      ...initialForm,
      blueprintRows: [createEmptyBlueprintRow()],
    });
    setEditingId(null);
    setError("");
    setGenerationWarnings([]);
  }

  function getQuestionCategoryId(question) {
    return typeof question.category === "object"
      ? question.category?._id
      : question.category;
  }

  function validateBlueprintRows() {
    const warnings = [];
    const categorySet = new Set();

    for (const row of formData.blueprintRows) {
      const rowCategoryName =
        categories.find((item) => item._id === row.category)?.title || "Selected category";

      if (!row.category) {
        warnings.push("Each blueprint row must have a category.");
      }

      if (!row.totalQuestions || Number(row.totalQuestions) <= 0) {
        warnings.push(`Total questions must be greater than 0 for ${rowCategoryName}.`);
      }

      const easy = Number(row.easyPercentage) || 0;
      const medium = Number(row.mediumPercentage) || 0;
      const hard = Number(row.hardPercentage) || 0;
      const totalPercentage = easy + medium + hard;

      if (totalPercentage !== 100) {
        warnings.push(
          `${rowCategoryName}: easy + medium + hard percentage must equal 100.`
        );
      }

      if (row.category) {
        if (categorySet.has(row.category)) {
          warnings.push(
            `${rowCategoryName} is added more than once. Use one row per category.`
          );
        }
        categorySet.add(row.category);
      }
    }

    return warnings;
  }

  function generateQuestionsFromBlueprint() {
    const rowValidationWarnings = validateBlueprintRows();

    if (rowValidationWarnings.length > 0) {
      setGenerationWarnings(rowValidationWarnings);
      setError("Please fix the Caterory rows before generating questions.");
      return;
    }

    const selectedIds = new Set(); 
    const generatedQuestionIds = [];
    const warnings = [];

    formData.blueprintRows.forEach((row) => {
      const totalQuestions = Number(row.totalQuestions) || 0;
      const easyPercentage = Number(row.easyPercentage) || 0;
      const mediumPercentage = Number(row.mediumPercentage) || 0;
      const hardPercentage = Number(row.hardPercentage) || 0;

      const easyCount = Math.round((totalQuestions * easyPercentage) / 100);
      const mediumCount = Math.round((totalQuestions * mediumPercentage) / 100);
      const hardCount = totalQuestions - easyCount - mediumCount;

      const categoryName =
        categories.find((item) => item._id === row.category)?.title || "Unknown category";

      const categoryQuestions = questions.filter((question) => {
        const questionCategoryId = getQuestionCategoryId(question);
        return questionCategoryId === row.category && question.status === "active";
      });

      const easyPool = shuffleArray(
        categoryQuestions.filter(
          (question) => question.difficulty === "easy" && !selectedIds.has(question._id)
        )
      );
      const mediumPool = shuffleArray(
        categoryQuestions.filter(
          (question) => question.difficulty === "medium" && !selectedIds.has(question._id)
        )
      );
      const hardPool = shuffleArray(
        categoryQuestions.filter(
          (question) => question.difficulty === "hard" && !selectedIds.has(question._id)
        )
      );

      const pickedEasy = easyPool.slice(0, easyCount);
      const pickedMedium = mediumPool.slice(0, mediumCount);
      const pickedHard = hardPool.slice(0, hardCount);

      if (pickedEasy.length < easyCount) {
        warnings.push(
          `${categoryName}: requested ${easyCount} easy questions but only ${pickedEasy.length} available.`
        );
      }

      if (pickedMedium.length < mediumCount) {
        warnings.push(
          `${categoryName}: requested ${mediumCount} medium questions but only ${pickedMedium.length} available.`
        );
      }

      if (pickedHard.length < hardCount) {
        warnings.push(
          `${categoryName}: requested ${hardCount} hard questions but only ${pickedHard.length} available.`
        );
      }

      const rowSelected = [...pickedEasy, ...pickedMedium, ...pickedHard];

      rowSelected.forEach((question) => {
        selectedIds.add(question._id);
        generatedQuestionIds.push(question._id);
      });
    });

    setFormData((prev) => ({
      ...prev,
      questions: generatedQuestionIds,
    }));

    setGenerationWarnings(warnings);

    if (generatedQuestionIds.length === 0) {
      setError("No questions could be generated from the current blueprint.");
      return;
    }

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const rowValidationWarnings = validateBlueprintRows();
    if (rowValidationWarnings.length > 0) {
      setGenerationWarnings(rowValidationWarnings);
      setError("Please fix the blueprint rows before saving.");
      return;
    }

    if (formData.questions.length === 0) {
      setError("Generate questions before saving the question paper.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const primaryCategory = formData.blueprintRows[0]?.category || "";

      const payload = {
        title: formData.title,
        category: primaryCategory,
        difficulty: "mixed",
        status: formData.status,
        duration: calculatedDuration,
        totalMarks: calculatedTotalMarks,
        questions: formData.questions,
        blueprint: formData.blueprintRows.map((row) => ({
          category: row.category,
          totalQuestions: Number(row.totalQuestions),
          easyPercentage: Number(row.easyPercentage),
          mediumPercentage: Number(row.mediumPercentage),
          hardPercentage: Number(row.hardPercentage),
        })),
      };

      if (editingId) {
        await updateQuestionPaper(editingId, payload);
      } else {
        await createQuestionPaper(payload);
      }

      await loadPapers();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save question paper");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(paper) {
    const mappedBlueprint =
      Array.isArray(paper.blueprint) && paper.blueprint.length > 0
        ? paper.blueprint.map((row, index) => ({
            id: `${paper._id}-${index}`,
            category:
              typeof row.category === "object" ? row.category?._id || "" : row.category || "",
            totalQuestions: row.totalQuestions || 0,
            easyPercentage: row.easyPercentage || 0,
            mediumPercentage: row.mediumPercentage || 0,
            hardPercentage: row.hardPercentage || 0,
          }))
        : [
            {
              id: `${paper._id}-fallback`,
              category:
                typeof paper.category === "object"
                  ? paper.category?._id || ""
                  : paper.category || "",
              totalQuestions: paper.questions?.length || 0,
              easyPercentage: 34,
              mediumPercentage: 33,
              hardPercentage: 33,
            },
          ];

    setEditingId(paper._id);
    setFormData({
      id: paper._id,
      title: paper.title || "",
      status: paper.status || "active",
      blueprintRows: mappedBlueprint,
      questions: (paper.questions || []).map((q) => q._id || q),
    });

    setGenerationWarnings([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(paperId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question paper?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(paperId);
      await deleteQuestionPaper(paperId);
      await loadPapers();
    } catch (err) {
      alert(err.message || "Failed to delete question paper");
    } finally {
      setDeletingId(null);
    }
  }

  const categories = useMemo(() => {
    return [...categoryOptions].sort((a, b) => a.title.localeCompare(b.title));
  }, [categoryOptions]);

  const totalPages = Math.max(1, Math.ceil(papers.length / ITEMS_PER_PAGE));

  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return papers.slice(startIndex, endIndex);
  }, [papers, currentPage]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  const selectedQuestionsDetails = useMemo(() => {
    return questions.filter((q) => formData.questions.includes(q._id));
  }, [questions, formData.questions]);

  const calculatedTotalMarks = useMemo(() => {
    return selectedQuestionsDetails.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );
  }, [selectedQuestionsDetails]);

  const calculatedDuration = useMemo(() => {
    return selectedQuestionsDetails.reduce(
      (sum, q) => sum + (Number(q.duration) || 0),
      0
    );
  }, [selectedQuestionsDetails]);

  const blueprintSummary = useMemo(() => {
    return formData.blueprintRows.map((row) => {
      const totalQuestions = Number(row.totalQuestions) || 0;
      const easyCount = Math.round((totalQuestions * (Number(row.easyPercentage) || 0)) / 100);
      const mediumCount = Math.round(
        (totalQuestions * (Number(row.mediumPercentage) || 0)) / 100
      );
      const hardCount = totalQuestions - easyCount - mediumCount;

      const categoryQuestions = questions.filter((question) => {
        const questionCategoryId = getQuestionCategoryId(question);
        return questionCategoryId === row.category && question.status === "active";
      });

      return {
        ...row,
        categoryName:
          categories.find((item) => item._id === row.category)?.title || "-",
        easyCount,
        mediumCount,
        hardCount,
        availableEasy: categoryQuestions.filter((q) => q.difficulty === "easy").length,
        availableMedium: categoryQuestions.filter((q) => q.difficulty === "medium").length,
        availableHard: categoryQuestions.filter((q) => q.difficulty === "hard").length,
      };
    });
  }, [formData.blueprintRows, categories, questions]);

  const selectedQuestionPages = Math.max(
    1,
    Math.ceil(selectedQuestionsDetails.length / QUESTIONS_PER_PAGE)
  );

  const selectedQuestionsPreview = useMemo(() => {
    return selectedQuestionsDetails.slice(0, QUESTIONS_PER_PAGE);
  }, [selectedQuestionsDetails]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Question Papers</h1>
          <p className="mt-2 text-sm text-slate-600">
            Build question papers from category-wise blueprint rows and difficulty percentages.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          {editingId ? "Edit Question Paper" : "Add Question Paper"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Paper Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              required
            />
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

          <div className="md:col-span-2 rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Rows</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Add category-wise rows with total questions and easy, medium, hard percentages.
                </p>
              </div>

              <button
                type="button"
                onClick={addBlueprintRow}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Add Row
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {formData.blueprintRows.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      Row {index + 1}
                    </p>

                    {formData.blueprintRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBlueprintRow(row.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="xl:col-span-1">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Category
                      </label>
                      <select
                        value={row.category}
                        onChange={(e) =>
                          handleBlueprintRowChange(row.id, "category", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
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
                        Total Questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={row.totalQuestions}
                        onChange={(e) =>
                          handleBlueprintRowChange(
                            row.id,
                            "totalQuestions",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Easy %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.easyPercentage}
                        onChange={(e) =>
                          handleBlueprintRowChange(
                            row.id,
                            "easyPercentage",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Medium %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.mediumPercentage}
                        onChange={(e) =>
                          handleBlueprintRowChange(
                            row.id,
                            "mediumPercentage",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Hard %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.hardPercentage}
                        onChange={(e) =>
                          handleBlueprintRowChange(
                            row.id,
                            "hardPercentage",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={generateQuestionsFromBlueprint}
                disabled={questionsLoading || categoryLoading}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Generate Questions
              </button>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formData.questions.length} selected
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {calculatedTotalMarks} marks
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {calculatedDuration} mins
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Duration (auto-calculated)
            </label>
            <input
              type="number"
              value={calculatedDuration}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Total Marks (auto-calculated)
            </label>
            <input
              type="number"
              value={calculatedTotalMarks}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
            />
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-900">Blueprint Summary</h3>

            {blueprintSummary.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                No Category rows added.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-3 py-3 font-semibold">Category</th>
                      <th className="px-3 py-3 font-semibold">Total</th>
                      <th className="px-3 py-3 font-semibold">Easy</th>
                      <th className="px-3 py-3 font-semibold">Medium</th>
                      <th className="px-3 py-3 font-semibold">Hard</th>
                      <th className="px-3 py-3 font-semibold">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprintSummary.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="px-3 py-3 text-slate-900">{row.categoryName}</td>
                        <td className="px-3 py-3 text-slate-700">{row.totalQuestions}</td>
                        <td className="px-3 py-3 text-slate-700">
                          {row.easyCount} / {row.availableEasy}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {row.mediumCount} / {row.availableMedium}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {row.hardCount} / {row.availableHard}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {row.availableEasy + row.availableMedium + row.availableHard}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-200 p-5">
            <h3 className="text-base font-bold text-slate-900">Selected Questions Preview</h3>

            {questionsLoading ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                Loading questions...
              </div>
            ) : selectedQuestionsDetails.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                No questions selected yet. Generate questions from the blueprint.
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3">
                  {selectedQuestionsPreview.map((question, index) => (
                    <div
                      key={question._id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {index + 1}. {question.questionText}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                          {question.category?.title || "-"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                          {question.difficulty}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                          {question.marks} marks
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                          {question.duration} mins
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedQuestionsDetails.length > QUESTIONS_PER_PAGE && (
                  <p className="mt-4 text-sm text-slate-500">
                    Showing first {QUESTIONS_PER_PAGE} of {selectedQuestionsDetails.length} selected questions.
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-500">
                  Preview pages: {selectedQuestionPages}
                </p>
              </>
            )}
          </div>

          {/* {generationWarnings.length > 0 && (
            <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <p className="font-semibold text-amber-800">Generation warnings</p>
              <ul className="mt-2 space-y-1">
                {generationWarnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>- {warning}</li>
                ))}
              </ul>
            </div>
          )} */}

          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={
                saving ||
                categoryLoading ||
                questionsLoading ||
                formData.questions.length === 0
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Question Paper"
                : "Add Question Paper"}
            </button>

            {(editingId || formData.questions.length > 0) && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset Form
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-slate-900">Question Paper List</h2>

          <div className="grid w-full gap-3 md:max-w-4xl md:grid-cols-4">
            <input
              type="text"
              placeholder="Search papers..."
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
              <option value="mixed">Mixed</option>
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
          <div className="mt-6 text-sm text-slate-500">
            Loading question papers...
          </div>
        ) : papers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No question papers found.
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {paginatedPapers.map((paper, index) => {
                const categoryTitle =
                  typeof paper.category === "object"
                    ? paper.category?.title || "-"
                    : paper.category || "-";

                return (
                  <div
                    key={paper._id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-500">
                          Paper {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </p>

                        <h3 className="mt-2 text-base font-semibold text-slate-900">
                          {paper.title}
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                            {categoryTitle}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                            {paper.difficulty || "mixed"}
                          </span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                            {paper.totalMarks} marks
                          </span>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                            {paper.duration} mins
                          </span>
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                            {paper.status}
                          </span>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                            {paper.questions?.length || 0} questions
                          </span>
                        </div>

                        {Array.isArray(paper.blueprint) && paper.blueprint.length > 0 && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">
                              Blueprint
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                              {paper.blueprint.map((row, rowIndex) => {
                                const rowCategory =
                                  typeof row.category === "object"
                                    ? row.category?.title || "-"
                                    : row.category || "-";

                                return (
                                  <span
                                    key={`${paper._id}-blueprint-${rowIndex}`}
                                    className="rounded-full bg-white px-3 py-1 text-slate-700 ring-1 ring-slate-200"
                                  >
                                    {rowCategory}: {row.totalQuestions} Qs, E {row.easyPercentage}%,
                                    M {row.mediumPercentage}%, H {row.hardPercentage}%
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(paper)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(paper._id)}
                          disabled={deletingId === paper._id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === paper._id ? "Deleting..." : "Delete"}
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
                  {papers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, papers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">{papers.length}</span>{" "}
                question papers
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
  );
}

export default QuestionPapers;