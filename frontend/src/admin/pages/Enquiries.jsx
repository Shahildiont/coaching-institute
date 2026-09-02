import { useEffect, useMemo, useState } from "react";
import {
  deleteEnquiry,
  getAllEnquiries,
  updateEnquiry,
} from "../../services/enquiryService";

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchEnquiries() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllEnquiries();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message || "Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    const query = search.toLowerCase();

    return enquiries.filter((item) => {
      return (
        item.name?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.courseInterest?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    });
  }, [enquiries, search]);

  async function handleStatusChange(id, status) {
    try {
      const data = await updateEnquiry(id, { status });

      setEnquiries((prev) =>
        prev.map((item) => (item._id === id ? data.enquiry : item))
      );
    } catch (err) {
      alert(err.message || "Failed to update enquiry status");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this enquiry?");
    if (!confirmed) return;

    try {
      await deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete enquiry");
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin Panel
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Enquiries</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and manage leads submitted from the landing page.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by name, phone, email, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 md:max-w-md"
          />

          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">{filteredEnquiries.length}</span>
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-slate-500">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No enquiries found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Course Interest</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((item) => (
                  <tr key={item._id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-4">{item.phone}</td>
                    <td className="px-4 py-4">{item.email || "—"}</td>
                    <td className="px-4 py-4">{item.courseInterest || "—"}</td>
                    <td className="px-4 py-4">{item.source || "—"}</td>
                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 max-w-xs">{item.message || "—"}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
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

export default Enquiries;