import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { createEnquiry } from "../services/enquiryService";

const MagneticSubmit = motion.create("button");

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Enquire() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    courseInterest: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const btnRef = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

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
      setLoading(true);
      setError("");
      setSuccessMessage("");

      await createEnquiry({
        ...formData,
        source: "landing-page",
      });

      setSuccessMessage("Your enquiry has been submitted successfully.");
      setFormData({
        name: "",
        phone: "",
        email: "",
        courseInterest: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit enquiry");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "Enter your name", required: true },
    { name: "phone", label: "Phone Number", type: "text", placeholder: "Enter phone number", required: true },
    { name: "email", label: "Email Address", type: "email", placeholder: "Enter email", required: false },
    { name: "courseInterest", label: "Course Interested In", type: "text", placeholder: "Enter course name", required: false },
  ];

  return (
    <section className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-slate-50 px-4 py-30 sm:px-6 lg:px-8">
      {/* ambient blobs, consistent with rest of app */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        {/* LEFT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#2c4058] p-8 text-white shadow-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          />

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300"
          >
            Enquire Now
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-4 text-4xl font-bold leading-tight"
          >
            Start your preparation with the right guidance
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-4 text-base leading-7 text-slate-300"
          >
            Share your details and our team will connect with you to guide you
            on courses, preparation plans, and the best next step for your
            goals.
          </motion.p>

          <div className="mt-8 space-y-4 text-sm text-slate-300">
            {[
              "Personal guidance for students and parents",
              "Course recommendations based on your goal",
              "Quick callback from the institute team",
            ].map((text, i) => (
              <motion.div
                key={text}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3 + i}
                whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.08)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT PANEL: FORM */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold text-slate-900"
          >
            Send your enquiry
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-2 text-sm text-slate-600"
          >
            Fill in the form below and we will contact you soon.
          </motion.p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    required={field.required}
                    className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                  />
                  {focusedField === field.name && (
                    <motion.div
                      layoutId="enquiryFocusRing"
                      className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-slate-900/15"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + fields.length * 0.06, duration: 0.5 }}
            >
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Message
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Write your message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                />
                {focusedField === "message" && (
                  <motion.div
                    layoutId="enquiryFocusRing"
                    className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-slate-900/15"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
                    className="mr-2 inline-block"
                  >
                    ✓
                  </motion.span>
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <MagneticSubmit
              onMouseMove={(e) => {
                if (loading) return;
                const r = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - r.left - r.width / 2) * 0.1);
                y.set((e.clientY - r.top - r.height / 2) * 0.25);
              }}
              onMouseLeave={() => { x.set(0); y.set(0); }}
              style={{ x: sx, y: sy }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                    />
                    Submitting...
                  </motion.span>
                ) : (
                  <motion.span
                    key="submit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Submit Enquiry
                  </motion.span>
                )}
              </AnimatePresence>
            </MagneticSubmit>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default Enquire;