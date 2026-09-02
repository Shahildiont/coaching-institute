import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getCourseCheckout,
  applyCourseCoupon,
} from "../services/paymentService";

function formatDiscount(coupon) {
  if (!coupon) return "";

  if (coupon.discountType === "percent") {
    return `${coupon.discountValue}% off`;
  }

  return `₹${coupon.discountValue} off`;
}

function CoursePayment() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [earnedCoupons, setEarnedCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [pricing, setPricing] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [error, setError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    async function fetchCheckout() {
      try {
        setLoading(true);
        setError("");
        setCouponMessage("");

        const data = await getCourseCheckout(id);
        setCourse(data.course || null);
        setEarnedCoupons(data.earnedCoupons || []);
        setPricing(data.pricing || null);
      } catch (err) {
        setError(err.message || "Failed to load payment page");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCheckout();
    }
  }, [id]);

  async function handleApplyCoupon() {
    if (!selectedCouponId) {
      setCouponMessage("Please select a coupon first.");
      return;
    }

    try {
      setApplyingCoupon(true);
      setCouponMessage("");

      const data = await applyCourseCoupon(id, {
        couponId: selectedCouponId,
      });

      setAppliedCoupon(data.appliedCoupon || null);
      setPricing(data.pricing || null);
      setCouponMessage(data.message || "Coupon applied successfully.");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMessage(err.message || "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  const hasCoupons = useMemo(() => earnedCoupons.length > 0, [earnedCoupons]);

  if (loading) {
    return (
      <section className="bg-white pt-32 pb-14 sm:pt-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Loading payment page...</p>
        </div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="bg-white pt-32 pb-14 sm:pt-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error || "Course not found"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pt-32 pb-14 sm:pt-36">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Course Checkout
          </p>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            {course.title}
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {course.description || "Course details will be available soon."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Category
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {course.category || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Mode
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {course.mode || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Duration
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {course.duration || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Course Fee
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                ₹{course.price || 0}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Your Earned Coupons
            </p>

            {!hasCoupons ? (
              <p className="mt-3 text-sm text-slate-600">
                No earned coupons are available for your account.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {earnedCoupons.map((coupon) => (
                  <label
                    key={coupon._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                      selectedCouponId === coupon._id
                        ? "border-slate-900 bg-white"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="coupon"
                      value={coupon._id}
                      checked={selectedCouponId === coupon._id}
                      onChange={(e) => setSelectedCouponId(e.target.value)}
                      className="mt-1"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-base font-bold text-slate-900">
                          {coupon.title}
                        </h2>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {formatDiscount(coupon)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        Code:{" "}
                        <span className="font-semibold text-slate-900">
                          {coupon.code}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Valid for score range {coupon.minPercentage}% to{" "}
                        {coupon.maxPercentage}%.
                      </p>

                      {coupon.description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {coupon.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!selectedCouponId || applyingCoupon}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applyingCoupon ? "Applying..." : "Apply Coupon"}
              </button>

              <Link
                to="/quiz"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
              >
                Earn More Coupons
              </Link>
            </div>

            {couponMessage && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {couponMessage}
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
              <span>Course price</span>
              <span className="font-semibold text-slate-900">
                ₹{pricing?.originalPrice ?? course.price ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
              <span>Discount</span>
              <span className="font-semibold text-emerald-700">
                - ₹{pricing?.discountAmount ?? 0}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-slate-900">
                  Final amount
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  ₹{pricing?.finalPrice ?? course.price ?? 0}
                </span>
              </div>
            </div>
          </div>

          {appliedCoupon && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Applied Coupon
              </p>
              <p className="mt-2 text-base font-bold text-slate-900">
                {appliedCoupon.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {appliedCoupon.code} • {formatDiscount(appliedCoupon)}
              </p>
            </div>
          )}

          <button
            type="button"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Proceed to Pay
          </button>
        </aside>
      </div>
    </section>
  );
}

export default CoursePayment;