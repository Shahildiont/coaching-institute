import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicCourses } from "../services/publicService";

function SkeletonCard() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 md:px-8">
      <div className="grid gap-6 md:grid-cols-[1.35fr_0.85fr_0.8fr] md:items-start">
        <div>
          <div className="flex gap-3">
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 h-7 w-3/4 animate-pulse rounded-md bg-slate-100" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-md bg-slate-100" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.25 } },
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicCourses();
        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(query) ||
        course.category?.toLowerCase().includes(query) ||
        course.mode?.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" || course.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, search, activeCategory]);

  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-20 sm:pt-36">
      {/* ambient background blobs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-50 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-slate-50 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            {courses.length > 0 ? `${courses.length} Courses Available` : "Course Catalog"}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find the right course for your goal
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            Browse structured programs designed around consistent practice,
            regular testing, and clear guidance.
          </p>
        </motion.div>

        {/* search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 max-w-xl"
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:shadow-md"
            />

            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* category chips */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {activeCategory === cat && (
                  <motion.span
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 rounded-full bg-slate-900"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* content */}
        {loading ? (
          <div className="mt-10 space-y-5">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"
          >
            <p className="text-base font-semibold text-slate-700">No courses found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or category filter.
            </p>
          </motion.div>
        ) : (
          <div className="mt-10 space-y-5">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course, i) => (
                <motion.div
                  key={course._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(15,23,42,0.08)" }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 md:px-8"
                >
                  <div className="grid gap-6 md:grid-cols-[1.35fr_0.85fr_0.8fr] md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                          {course.category || "Course"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {course.mode || "Offline"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-bold text-slate-900">
                        {course.title}
                      </h2>

                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                        {course.description || "Course details will be available soon."}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:bg-slate-100">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Duration
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {course.duration || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-colors hover:bg-slate-50">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Fees
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {course.price ? `₹ ${course.price}` : "Contact us"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end md:justify-between">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full md:w-auto">
                        <Link
                          to={`/courses/${course._id}/payment`}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 md:w-auto"
                        >
                          Join Now
                        </Link>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full md:w-auto">
                        <Link
                          to="/enquire"
                          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 md:w-auto"
                        >
                          Enquire Now
                        </Link>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full md:w-auto">
                        <Link
                          to="/quiz"
                          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50 md:w-auto"
                        >
                          Explore Test
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

export default Courses;