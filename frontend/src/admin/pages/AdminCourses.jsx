import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { deleteCourse, getAllCourses } from "../../services/courseService";

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function fetchCourses() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const query = search.toLowerCase();

      return (
        course.title?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query) ||
        course.mode?.toLowerCase().includes(query) ||
        course.status?.toLowerCase().includes(query)
      );
    });
  }, [courses, search]);

  async function handleDelete(courseId) {
    const confirmed = window.confirm("Are you sure you want to delete this course?");
    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
    } catch (err) {
      alert(err.message || "Failed to delete course");
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
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Courses</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create, update, and manage all coaching courses here.
          </p>
        </div>

        <Link
          to="/admin/courses/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Add Course
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by title, category, mode, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 md:max-w-md"
          />

          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">{filteredCourses.length}</span>
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-slate-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No courses found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-900">{course.title}</td>
                    <td className="px-4 py-4">{course.category}</td>
                    <td className="px-4 py-4">{course.mode}</td>
                    <td className="px-4 py-4">₹ {course.price}</td>
                    <td className="px-4 py-4">{course.duration}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          course.status === "active"
                            ? "bg-green-100 text-green-700"
                            : course.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/courses/${course._id}/edit`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(course._id)}
                          disabled={deletingId === course._id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === course._id ? "Deleting..." : "Delete"}
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

export default AdminCourses;