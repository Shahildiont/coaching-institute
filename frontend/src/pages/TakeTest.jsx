import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { getPublicTestById } from "../services/publicService";
import { submitQuizAttempt } from "../services/attemptService";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeOptions(options = []) {
  const fallbackKeys = ["A", "B", "C", "D"];

  return options
    .map((option, index) => {
      if (typeof option === "string") {
        return {
          key: fallbackKeys[index] || `OPT_${index + 1}`,
          text: option,
        };
      }

      if (option && typeof option === "object") {
        return {
          key: option.key || fallbackKeys[index] || `OPT_${index + 1}`,
          text: option.text || "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeQuestion(question, index) {
  if (!question || typeof question !== "object") {
    return null;
  }

  return {
    _id: question._id || `question-${index + 1}`,
    questionText:
      question.questionText ||
      question.text ||
      question.title ||
      `Question ${index + 1}`,
    options: normalizeOptions(question.options || []),
    correctAnswer: question.correctAnswer || "",
    difficulty: question.difficulty || "",
    marks: Number(question.marks) || 0,
    duration: Number(question.duration) || 0,
    explanation: question.explanation || "",
    category:
      typeof question.category === "object"
        ? question.category?.title || ""
        : question.category || "",
    status: question.status || "active",
  };
}

function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    setCheckingAuth(false);
  }, [navigate, location.pathname]);

  useEffect(() => {
    async function fetchTestData() {
      try {
        setLoading(true);
        setError("");

        const testData = await getPublicTestById(id);
        const loadedTest = testData?.quiz || null;

        let loadedQuestions =
          loadedTest?.questionPaper?.questions?.map((question, index) =>
            normalizeQuestion(question, index)
          ) || [];

        loadedQuestions = loadedQuestions.filter(Boolean);

        setTest(loadedTest);
        setQuestions(loadedQuestions);
        setCurrentIndex(0);
        setAnswers({});
        setTimeLeft((loadedTest?.duration || 0) * 60);
      } catch (err) {
        setError(err.message || "Failed to load test");
      } finally {
        setLoading(false);
      }
    }

    if (id && !checkingAuth) {
      fetchTestData();
    }
  }, [id, checkingAuth]);

  useEffect(() => {
    if (checkingAuth || loading || !test || hasSubmittedRef.current) {
      return undefined;
    }

    if (timeLeft <= 0) {
      handleSubmit("time_up");
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, loading, test, checkingAuth]);

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(Boolean).length;
  }, [answers]);

  function handleOptionSelect(questionId, optionKey) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  async function handleSubmit(submitStatus = "submitted") {
    if (hasSubmittedRef.current || !test?._id) {
      return;
    }

    try {
      hasSubmittedRef.current = true;
      clearTimeout(timerRef.current);
      setSubmitting(true);
      setError("");

      const payload = {
        status: submitStatus,
        timeSpentSeconds: Math.max((test.duration || 0) * 60 - timeLeft, 0),
        answers: questions.map((question) => ({
          question: question._id,
          selectedAnswer: answers[question._id] || "",
        })),
      };

      const data = await submitQuizAttempt(test._id, payload);
      const attemptId = data?.attempt?._id;

      if (!attemptId) {
        throw new Error("Attempt submission failed");
      }

      navigate(`/quiz/result/${attemptId}`);
    } catch (err) {
      hasSubmittedRef.current = false;
      setError(err.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth || loading) {
    return (
      <section className="bg-white pb-14 pt-32 sm:pt-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            {checkingAuth ? "Checking access..." : "Loading test..."}
          </p>
        </div>
      </section>
    );
  }

  if (error && !test) {
    return (
      <section className="bg-white pb-14 pt-32 sm:pt-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>

          <Link
            to="/quiz"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Tests
          </Link>
        </div>
      </section>
    );
  }

  if (!test) {
    return (
      <section className="bg-white pb-14 pt-32 sm:pt-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-sm text-slate-600">
            Test not found.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pb-14 pt-32 sm:pt-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-[24px] border border-slate-200 bg-white px-6 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                {test.examType || "Test"}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {test.status || "Active"}
              </span>

              {test.school?.name && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {test.school.name}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              {test.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {test.description ||
                "Please read each question carefully before answering."}
            </p>
          </div>

          <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Time Left
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {formatTime(timeLeft)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Answered
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {answeredCount} / {questions.length}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {questions.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-500">
            No questions are available for this test yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Questions</p>

              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-4">
                {questions.map((question, index) => {
                  const isActive = index === currentIndex;
                  const isAnswered = Boolean(answers[question._id]);

                  return (
                    <button
                      key={question._id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : isAnswered
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  Question {currentIndex + 1} of {questions.length}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {currentQuestion?.category && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {currentQuestion.category}
                    </span>
                  )}

                  {currentQuestion?.difficulty && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {currentQuestion.difficulty}
                    </span>
                  )}

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {currentQuestion?.marks ?? 0} marks
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {currentQuestion?.duration ?? 0} mins
                  </span>
                </div>
              </div>

              <h2 className="mt-5 text-xl font-bold leading-8 text-slate-900">
                {currentQuestion?.questionText}
              </h2>

              <div className="mt-6 space-y-3">
                {(currentQuestion?.options || []).map((option) => {
                  const optionKey = option.key;
                  const optionText = option.text || "";
                  const isSelected = answers[currentQuestion._id] === optionKey;

                  return (
                    <button
                      key={`${currentQuestion._id}-${optionKey}`}
                      type="button"
                      onClick={() =>
                        handleOptionSelect(currentQuestion._id, optionKey)
                      }
                      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isSelected
                            ? "bg-white text-slate-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {optionKey}
                      </span>

                      <span className="text-sm leading-6">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
                <Link
                  to="/quiz"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Exit Test
                </Link>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || submitting}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit("submitted")}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Test"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TakeTest;