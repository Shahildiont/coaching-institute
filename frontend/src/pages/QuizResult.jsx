import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getMyAttemptById } from "../services/attemptService";

function formatDiscount(coupon) {
  if (!coupon) return "";

  if (coupon.discountType === "percent") {
    return `${coupon.discountValue}% off`;
  }

  return `₹${coupon.discountValue} off`;
}

function QuizResult() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAttempt() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyAttemptById(id);
        setAttempt(data.attempt || null);
      } catch (err) {
        setError(err.message || "Failed to load result");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAttempt();
    }
  }, [id]);

  if (loading) {
    return (
      <section className="bg-white pt-32 pb-14 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">Loading result...</p>
        </div>
      </section>
    );
  }

  if (error || !attempt) {
    return (
      <section className="bg-white pt-32 pb-14 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error || "Result not found"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pt-32 pb-14 sm:pt-36">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {attempt.status === "time_up" ? "Time Up" : "Submitted"}
          </span>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            {attempt.quiz?.title}
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Score
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.scoredMarks} / {attempt.totalMarks}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Percentage
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.percentage ?? 0}%
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Correct
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.correctAnswers}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Wrong
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.wrongAnswers}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Unanswered
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.unansweredQuestions}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Answered
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.answeredQuestions} / {attempt.totalQuestions}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Time Spent
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {attempt.timeSpentSeconds} sec
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Assigned Coupon
            </p>

            {attempt.assignedCoupon ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {attempt.assignedCoupon.title}
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {formatDiscount(attempt.assignedCoupon)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Coupon code:{" "}
                  <span className="font-semibold text-slate-900">
                    {attempt.assignedCoupon.code}
                  </span>
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Valid for score range {attempt.assignedCoupon.minPercentage}% to{" "}
                  {attempt.assignedCoupon.maxPercentage}%.
                </p>

                {attempt.assignedCoupon.description && (
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {attempt.assignedCoupon.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                No coupon is assigned for this result.
              </p>
            )}
          </div>

          <div className="mt-8">
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuizResult;