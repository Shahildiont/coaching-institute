import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { createQuiz, getQuizById, updateQuiz } from "../../services/quizService";
import { getAllSchools } from "../../services/schoolService";
import { getAllTeams } from "../../services/teamService";
import { getAllQuestionPapers } from "../../services/questionPaperService";

const initialForm = {
  title: "",
  school: "",
  examType: "",
  status: "draft",
  description: "",
  teams: [],
  questionPaper: "",
};

const steps = [
  { id: 1, label: "School" },
  { id: 2, label: "Teams" },
  { id: 3, label: "Question Paper" },
];

function QuizForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(initialForm);
  const [schools, setSchools] = useState([]);
  const [teams, setTeams] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const [schoolData, teamData, paperData] = await Promise.all([
        getAllSchools(),
        getAllTeams({ status: "active" }),
        getAllQuestionPapers({ status: "active" }),
      ]);

      setSchools(schoolData.schools || []);
      setTeams(teamData.teams || []);
      setQuestionPapers(paperData.questionPapers || []);

      if (id) {
        const quizData = await getQuizById(id);
        const quiz = quizData.quiz;

        setFormData({
          title: quiz.title || "",
          school: quiz.school?._id || quiz.school || "",
          examType: quiz.examType || "",
          status: quiz.status || "draft",
          description: quiz.description || "",
          teams: quiz.teams?.map((team) => team._id || team) || [],
          questionPaper: quiz.questionPaper?._id || quiz.questionPaper || "",
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load quiz form");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleTeamToggle(teamId) {
    setFormData((prev) => {
      const exists = prev.teams.includes(teamId);

      return {
        ...prev,
        teams: exists
          ? prev.teams.filter((id) => id !== teamId)
          : [...prev.teams, teamId],
      };
    });
  }

  function validateStep() {
    if (step === 1) {
      if (!formData.title || !formData.school || !formData.examType) {
        setError("Please fill title, school, and exam type.");
        return false;
      }
    }

    if (step === 2) {
      if (formData.teams.length === 0) {
        setError("Please select at least one team.");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.questionPaper) {
        setError("Please select a question paper.");
        return false;
      }
    }

    setError("");
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, steps.length));
  }

  function prevStep() {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateStep()) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: formData.title,
        school: formData.school,
        examType: formData.examType,
        status: formData.status,
        description: formData.description,
        teams: formData.teams,
        questionPaper: formData.questionPaper,
      };

      if (id) {
        await updateQuiz(id, payload);
      } else {
        await createQuiz(payload);
      }

      navigate("/admin/quizzes");
    } catch (err) {
      setError(err.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  }

  const selectedPaperDetails = useMemo(() => {
    return questionPapers.find((paper) => paper._id === formData.questionPaper);
  }, [questionPapers, formData.questionPaper]);

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="text-sm text-slate-500">Loading quiz form...</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin Panel
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {id ? "Edit Quiz" : "Create Quiz"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Create quiz step by step by selecting school, teams, and a question paper.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((item) => {
            const isActive = step === item.id;
            const isCompleted = step > item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border px-4 py-4 ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Step {item.id}
                </p>
                <p className="mt-2 text-sm font-bold">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        {step === 1 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Quiz Title
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
                School
              </label>
              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              >
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Exam Type
              </label>
              <input
                type="text"
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                placeholder="e.g. General Choose, MCQ, Test"
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
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Teams</h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose one or more teams for this quiz.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {teams.map((team) => (
                <label
                  key={team._id}
                  className={`cursor-pointer rounded-2xl border p-4 ${
                    formData.teams.includes(team._id)
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.teams.includes(team._id)}
                      onChange={() => handleTeamToggle(team._id)}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{team.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {team.description || "No description"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-blue-700">
                        {team.members?.length || 0} staff members
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Select Question Paper
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick one question paper to use for this quiz.
            </p>

            {selectedPaperDetails && (
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {selectedPaperDetails.title}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {selectedPaperDetails.totalMarks} marks
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {selectedPaperDetails.duration} mins
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {selectedPaperDetails.questions?.length || 0} questions
                </span>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {questionPapers.map((paper) => (
                <label
                  key={paper._id}
                  className={`cursor-pointer rounded-2xl border p-4 ${
                    formData.questionPaper === paper._id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="questionPaper"
                      value={paper._id}
                      checked={formData.questionPaper === paper._id}
                      onChange={handleChange}
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {paper.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {paper.category?.title || "-"} • {paper.difficulty}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                          {paper.totalMarks} marks
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                          {paper.duration} mins
                        </span>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                          {paper.questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {questionPapers.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                No question papers found. Create question papers first.
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          {step < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : id ? "Update Quiz" : "Create Quiz"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default QuizForm;