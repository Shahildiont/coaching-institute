import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { deleteCoupon, getAllCoupons } from "../../services/couponService";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function fetchCoupons() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllCoupons();
      setCoupons(data.coupons || []);
    } catch (err) {
      setError(err.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    const query = search.toLowerCase();

    return coupons.filter((coupon) => {
      return (
        coupon.title?.toLowerCase().includes(query) ||
        coupon.code?.toLowerCase().includes(query) ||
        coupon.discountType?.toLowerCase().includes(query) ||
        coupon.status?.toLowerCase().includes(query)
      );
    });
  }, [coupons, search]);

  async function handleDelete(couponId) {
    const confirmed = window.confirm("Are you sure you want to delete this coupon?");
    if (!confirmed) return;

    try {
      setDeletingId(couponId);
      await deleteCoupon(couponId);
      setCoupons((prev) => prev.filter((coupon) => coupon._id !== couponId));
    } catch (err) {
      alert(err.message || "Failed to delete coupon");
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
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Coupons</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage coupon ranges based on student test percentage.
          </p>
        </div>

        <Link
          to="/admin/coupons/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Add Coupon
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by title, code, type, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 md:max-w-md"
          />

          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">{filteredCoupons.length}</span>
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-sm text-slate-500">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No coupons found.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Range</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 font-medium text-slate-900">{coupon.title}</td>
                    <td className="px-4 py-4">{coupon.code}</td>
                    <td className="px-4 py-4">
                      {coupon.minPercentage}% - {coupon.maxPercentage}%
                    </td>
                    <td className="px-4 py-4">
                      {coupon.discountType === "percent"
                        ? `${coupon.discountValue}%`
                        : `₹ ${coupon.discountValue}`}
                    </td>
                    <td className="px-4 py-4">
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          coupon.status === "active"
                            ? "bg-green-100 text-green-700"
                            : coupon.status === "inactive"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/coupons/${coupon._id}/edit`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(coupon._id)}
                          disabled={deletingId === coupon._id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === coupon._id ? "Deleting..." : "Delete"}
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

export default Coupons;