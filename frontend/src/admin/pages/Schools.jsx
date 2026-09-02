import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { deleteSchool, getAllSchools } from "../../services/schoolService";

function Schools() {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function fetchSchools() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllSchools();
      setSchools(data.schools || []);
    } catch (err) {
      setError(err.message || "Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    const query = search.toLowerCase();

    return schools.filter((school) => {
      return (
        school.name?.toLowerCase().includes(query) ||
        school.code?.toLowerCase().includes(query) ||
        school.status?.toLowerCase().includes(query)
      );
    });
  }, [schools, search]);

  async function handleDelete(schoolId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this school?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(schoolId);
      await deleteSchool(schoolId);
      setSchools((prev) => prev.filter((school) => school._id !== schoolId));
    } catch (err) {
      alert(err.message || "Failed to delete school");
    } finally {
      setDeletingId(null);
    }
  }

  const summary = useMemo(() => {
    return filteredSchools.reduce(
      (acc, school) => {
        acc.totalSchools += 1;
        acc.totalQuizzes += Number(school.stats?.totalQuizzes || 0);
        acc.totalAttempts += Number(school.stats?.totalAttempts || 0);
        acc.totalStudentsAttempted += Number(
          school.stats?.uniqueStudentsAttempted || 0
        );
        acc.totalCoupons += Number(school.stats?.totalCouponsAssigned || 0);
        acc.totalAveragePercentage += Number(
          school.stats?.averagePercentage || 0
        );
        return acc;
      },
      {
        totalSchools: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
        totalStudentsAttempted: 0,
        totalCoupons: 0,
        totalAveragePercentage: 0,
      }
    );
  }, [filteredSchools]);

  const overallAveragePercentage =
    summary.totalSchools > 0
      ? (summary.totalAveragePercentage / summary.totalSchools).toFixed(2)
      : "0.00";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Schools</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create, manage, and monitor school-level quiz activity.
          </p>
        </div>

        <Link
          to="/admin/schools/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Add School
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Schools
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.totalSchools}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Quizzes
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.totalQuizzes}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Attempts
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.totalAttempts}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Students Attempted
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summary.totalStudentsAttempted}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Avg Percentage
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {overallAveragePercentage}%
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by name, code, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 md:max-w-md"
          />

          <p className="text-sm text-slate-500">
            Total:{" "}
            <span className="font-semibold text-slate-900">
              {filteredSchools.length}
            </span>
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-slate-500">Loading schools...</div>
        ) : filteredSchools.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No schools found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quizzes</th>
                  <th className="px-4 py-3">Attempts</th>
                  <th className="px-4 py-3">Students Attempted</th>
                  <th className="px-4 py-3">Avg %</th>
                  <th className="px-4 py-3">Coupons</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((school) => (
                  <tr key={school._id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {school.name}
                    </td>

                    <td className="px-4 py-4">{school.code || "-"}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          school.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {school.stats?.totalQuizzes ?? 0}
                    </td>

                    <td className="px-4 py-4">
                      {school.stats?.totalAttempts ?? 0}
                    </td>

                    <td className="px-4 py-4">
                      {school.stats?.uniqueStudentsAttempted ?? 0}
                    </td>

                    <td className="px-4 py-4">
                      {school.stats?.averagePercentage ?? 0}%
                    </td>

                    <td className="px-4 py-4">
                      {school.stats?.totalCouponsAssigned ?? 0}
                    </td>

                    <td className="px-4 py-4 max-w-[220px]">
                      <span className="line-clamp-2">
                        {school.description || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/admin/schools/${school._id}`}
                          className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          View
                        </Link>

                        <Link
                          to={`/admin/schools/${school._id}/edit`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(school._id)}
                          disabled={deletingId === school._id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === school._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
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

export default Schools;