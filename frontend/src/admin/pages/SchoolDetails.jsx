import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getSchoolById } from "../../services/schoolService";

function SchoolDetails() {
  const { id } = useParams();

  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [lowPerformers, setLowPerformers] = useState([]);
  const [quizPerformance, setQuizPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSchool() {
      try {
        setLoading(true);
        setError("");

        const data = await getSchoolById(id);

        setSchool(data.school || null);
        setStats(data.stats || null);
        setQuizzes(data.quizzes || []);
        setRecentAttempts(data.recentAttempts || []);
        setTopStudents(data.topStudents || []);
        setLowPerformers(data.lowPerformers || []);
        setQuizPerformance(data.quizPerformance || []);
      } catch (err) {
        setError(err.message || "Failed to load school details");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSchool();
    }
  }, [id]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Loading school details...</p>
        </div>
      </section>
    );
  }

  if (error || !school) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error || "School not found"}
          </div>

          <Link
            to="/admin/schools"
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Schools
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            School Details
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {school.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {school.description || "No description added for this school."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Code: {school.code || "-"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                school.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {school.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/schools"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </Link>

          <Link
            to={`/admin/schools/${school._id}/edit`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Edit School
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Total Quizzes
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {stats?.totalQuizzes ?? 0}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Active Quizzes
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {stats?.activeQuizzes ?? 0}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Total Attempts
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {stats?.totalAttempts ?? 0}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Students Attempted
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {stats?.uniqueStudentsAttempted ?? 0}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Avg Percentage
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {stats?.averagePercentage ?? 0}%
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Coupons Assigned
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {stats?.totalCouponsAssigned ?? 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Quiz Performance</h2>

          {quizPerformance.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No quiz performance data available.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-sm font-semibold text-slate-700">
                    <th className="px-4 py-3">Quiz</th>
                    <th className="px-4 py-3">Attempts</th>
                    <th className="px-4 py-3">Avg %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizPerformance.map((item, index) => (
                    <tr key={item.quiz?._id || index} className="text-sm text-slate-700">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {item.quiz?.title || "-"}
                      </td>
                      <td className="px-4 py-4">{item.totalAttempts || 0}</td>
                      <td className="px-4 py-4">
                        {item.averagePercentage || 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Attempts</h2>

          {recentAttempts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No attempts found for this school.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {attempt.user?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {attempt.quiz?.title || "Quiz"} • {attempt.percentage || 0}%
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {attempt.status || "submitted"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Top Students</h2>

          {topStudents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No student performance data available.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {topStudents.map((student, index) => (
                <div
                  key={student.user?._id || index}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {student.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Attempts: {student.totalAttempts || 0}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {student.averagePercentage || 0}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Low Performers</h2>

          {lowPerformers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No low performer data available.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {lowPerformers.map((student, index) => (
                <div
                  key={student.user?._id || index}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {student.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Attempts: {student.totalAttempts || 0}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {student.averagePercentage || 0}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Quizzes</h2>

        {quizzes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No quizzes are assigned to this school.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Exam Type</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {quiz.title}
                    </td>
                    <td className="px-4 py-4">{quiz.examType || "-"}</td>
                    <td className="px-4 py-4">{quiz.totalQuestions || 0}</td>
                    <td className="px-4 py-4">{quiz.totalMarks || 0}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default SchoolDetails;