import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  createCoupon,
  getCouponById,
  updateCoupon,
} from "../../services/couponService";

const initialState = {
  title: "",
  code: "",
  minPercentage: "",
  maxPercentage: "",
  discountType: "percent",
  discountValue: "",
  status: "active",
  expiryDate: "",
  description: "",
};

function CouponForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCoupon() {
      if (!isEditMode) return;

      try {
        setLoading(true);
        setError("");

        const data = await getCouponById(id);
        const coupon = data.coupon;

        setFormData({
          title: coupon.title || "",
          code: coupon.code || "",
          minPercentage: coupon.minPercentage ?? "",
          maxPercentage: coupon.maxPercentage ?? "",
          discountType: coupon.discountType || "percent",
          discountValue: coupon.discountValue ?? "",
          status: coupon.status || "active",
          expiryDate: coupon.expiryDate
            ? new Date(coupon.expiryDate).toISOString().split("T")[0]
            : "",
          description: coupon.description || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load coupon");
      } finally {
        setLoading(false);
      }
    }

    loadCoupon();
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        minPercentage: Number(formData.minPercentage),
        maxPercentage: Number(formData.maxPercentage),
        discountValue: Number(formData.discountValue),
      };

      if (isEditMode) {
        await updateCoupon(id, payload);
      } else {
        await createCoupon(payload);
      }

      navigate("/admin/coupons");
    } catch (err) {
      setError(err.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {isEditMode ? "Edit Coupon" : "Add Coupon"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Create coupon rules based on test percentage range.
          </p>
        </div>

        <Link
          to="/admin/coupons"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="text-sm text-slate-500">Loading coupon details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Coupon Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter coupon title"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Coupon Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. TOPPER50"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                From Percentage
              </label>
              <input
                type="number"
                name="minPercentage"
                value={formData.minPercentage}
                onChange={handleChange}
                placeholder="e.g. 80"
                min="0"
                max="100"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                To Percentage
              </label>
              <input
                type="number"
                name="maxPercentage"
                value={formData.maxPercentage}
                onChange={handleChange}
                placeholder="e.g. 100"
                min="0"
                max="100"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Discount Type
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                <option value="percent">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Discount Value
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder="Enter discount value"
                min="1"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
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

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Optional note about this coupon rule"
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
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : isEditMode ? "Update Coupon" : "Create Coupon"}
              </button>

              <Link
                to="/admin/coupons"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default CouponForm;