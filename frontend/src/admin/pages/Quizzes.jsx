import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { deleteQuiz, getAllQuizzes } from "../../services/quizService";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingQrId, setDownloadingQrId] = useState(null);
  const [sharingQrId, setSharingQrId] = useState(null);
  const [error, setError] = useState("");
  const [activeQrQuiz, setActiveQrQuiz] = useState(null);

  async function fetchQuizzes() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const query = search.toLowerCase();

    return quizzes.filter((quiz) => {
      return (
        quiz.title?.toLowerCase().includes(query) ||
        quiz.examType?.toLowerCase().includes(query) ||
        quiz.status?.toLowerCase().includes(query) ||
        quiz.school?.name?.toLowerCase().includes(query)
      );
    });
  }, [quizzes, search]);

  function getQuizUrl(quizId) {
    return `${window.location.origin}/quiz/${quizId}`;
  }

  function getQrUrl(quizId) {
    const quizUrl = getQuizUrl(quizId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(
      quizUrl
    )}`;
  }

  function sanitizeFileName(value) {
    return String(value || "quiz")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function getQrFile(quiz) {
    const response = await fetch(getQrUrl(quiz._id));

    if (!response.ok) {
      throw new Error("Failed to generate QR code");
    }

    const blob = await response.blob();

    return new File([blob], `${sanitizeFileName(quiz.title)}-qr.png`, {
      type: "image/png",
    });
  }

  async function handleCopyLink(quizId) {
    const quizUrl = getQuizUrl(quizId);

    try {
      await navigator.clipboard.writeText(quizUrl);
      alert("Test link copied successfully");
    } catch {
      alert("Failed to copy link");
    }
  }

  async function handleDownloadQr(quiz) {
    try {
      setDownloadingQrId(quiz._id);

      const file = await getQrFile(quiz);
      const downloadUrl = URL.createObjectURL(file);

      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = file.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (err) {
      alert(err.message || "Failed to download QR code");
    } finally {
      setDownloadingQrId(null);
    }
  }

  async function handleShareQr(quiz) {
    const quizUrl = getQuizUrl(quiz._id);

    try {
      setSharingQrId(quiz._id);

      if (navigator.share) {
        try {
          const file = await getQrFile(quiz);

          if (
            navigator.canShare &&
            navigator.canShare({ files: [file] })
          ) {
            await navigator.share({
              title: quiz.title || "Quiz",
              text: `Open this test: ${quiz.title || "Quiz"}`,
              url: quizUrl,
              files: [file],
            });
            return;
          }
        } catch {
          // continue to URL/text share fallback
        }

        try {
          await navigator.share({
            title: quiz.title || "Quiz",
            text: `Open this test: ${quiz.title || "Quiz"}`,
            url: quizUrl,
          });
          return;
        } catch (err) {
          if (err?.name === "AbortError") {
            return;
          }
        }
      }

      await navigator.clipboard.writeText(quizUrl);
      alert("Share is not supported here. Test link copied instead.");
    } catch (err) {
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(quizUrl);
          alert("Unable to open share options. Test link copied instead.");
        } catch {
          alert(err.message || "Failed to share QR code");
        }
      }
    } finally {
      setSharingQrId(null);
    }
  }

  async function handleDelete(quizId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(quizId);
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
    } catch (err) {
      alert(err.message || "Failed to delete quiz");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Quizzes</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create and manage school-based quizzes from the question bank.
          </p>
        </div>

        <Link
          to="/admin/quizzes/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Add Quiz
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by title, school, exam type, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 md:max-w-md"
          />

          <p className="text-sm text-slate-500">
            Total:{" "}
            <span className="font-semibold text-slate-900">
              {filteredQuizzes.length}
            </span>
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-slate-500">Loading quizzes...</div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No quizzes found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Exam Type</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Total Marks</th>
                  <th className="px-4 py-3">Total Questions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredQuizzes.map((quiz) => {
                  const quizUrl = getQuizUrl(quiz._id);
                  const isDownloading = downloadingQrId === quiz._id;
                  const isSharing = sharingQrId === quiz._id;

                  return (
                    <tr key={quiz._id} className="text-sm text-slate-700">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {quiz.title}
                      </td>
                      <td className="px-4 py-4">{quiz.school?.name || "-"}</td>
                      <td className="px-4 py-4">{quiz.examType}</td>
                      <td className="px-4 py-4">{quiz.duration || 0} mins</td>
                      <td className="px-4 py-4">{quiz.totalMarks || 0}</td>
                      <td className="px-4 py-4">{quiz.totalQuestions || 0}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            quiz.status === "active"
                              ? "bg-green-100 text-green-700"
                              : quiz.status === "draft"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="min-w-[250px] space-y-2">
                          <a
                            href={quizUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-xs font-medium text-slate-600 underline underline-offset-2"
                          >
                            {quizUrl}
                          </a>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(quiz._id)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Copy Link
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setActiveQrQuiz(
                                  activeQrQuiz === quiz._id ? null : quiz._id
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              {activeQrQuiz === quiz._id ? "Hide QR" : "Show QR"}
                            </button>
                          </div>

                          {activeQrQuiz === quiz._id && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <img
                                src={getQrUrl(quiz._id)}
                                alt={`${quiz.title} QR code`}
                                className="h-36 w-36 rounded-xl border border-slate-200 bg-white object-contain"
                              />

                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadQr(quiz)}
                                  disabled={isDownloading}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isDownloading ? "Downloading..." : "Download QR"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleShareQr(quiz)}
                                  disabled={isSharing}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isSharing ? "Sharing..." : "Share QR"}
                                </button>
                              </div>

                              {/* <p className="mt-3 text-xs leading-5 text-slate-500">
                                Students can scan this QR to open the test page.
                                If they are not logged in, they should be sent to
                                login before starting the test.
                              </p> */}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            to={`/admin/quizzes/${quiz._id}/edit`}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(quiz._id)}
                            disabled={deletingId === quiz._id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === quiz._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Quizzes;