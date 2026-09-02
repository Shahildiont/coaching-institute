import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

function About() {
  const highlights = [
    {
      title: "Focused learning",
      value: "Structured",
      text: "Clear lessons, guided practice, and a routine that helps learners stay consistent.",
    },
    {
      title: "Built for progress",
      value: "Practical",
      text: "Courses, quizzes, and feedback designed to support steady improvement over time.",
    },
  ];

  const sections = [
    {
      title: "What we do",
      text: "We create a simple and dependable learning space for students who want better structure in their preparation. Instead of making learning feel crowded or confusing, we focus on clear course flow, regular practice, and measurable progress.",
    },
    {
      title: "Who it is for",
      text: "This platform is designed for students, schools, and coaching teams who want one place to manage learning, testing, and performance. It works especially well for disciplined learners who benefit from step-by-step preparation and frequent revision.",
    },
    {
      title: "How we work",
      text: "We believe good preparation comes from clarity, repetition, and consistency. That is why we organize learning into manageable steps, use quizzes to reinforce understanding, and make progress visible so students and institutions can act early.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 pt-28 text-slate-900">
      {/* ambient background blobs, consistent with Home/Courses/Quiz */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-blue-50 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 top-52 h-80 w-80 rounded-full bg-slate-100 blur-3xl"
      />

      {/* HERO CARD */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
        >
          <div className="grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.25fr_0.75fr] lg:px-12 lg:py-16">
            <div>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700"
              >
                About us
              </motion.p>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
              >
                A simple place for disciplined preparation
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg"
              >
                We help learners prepare with more clarity, better structure,
                and consistent practice. Our goal is to make progress easier
                to track for students, schools, and teaching teams.
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="mt-8 flex flex-wrap gap-3"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
                >
                  Structured learning
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700"
                >
                  Regular assessment
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700"
                >
                  Measurable progress
                </motion.span>
              </motion.div>
            </div>

            <div className="grid gap-4 self-start">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(15,23,42,0.08)" }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION CARDS */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {sections.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(15,23,42,0.1)" }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
                >
                  0{index + 1}
                </motion.div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  {section.title}
                </h2>
              </div>

              <p className="mt-5 text-[15px] leading-8 text-slate-600">
                {section.text}
              </p>
            </motion.article>
          ))}
        </div>

        {/* CLOSING BANNER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] sm:px-8 lg:px-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          />

          <h3 className="relative text-2xl font-semibold tracking-tight sm:text-3xl">
            Preparation works better when the path is clear
          </h3>
          <p className="relative mt-4 max-w-3xl text-sm leading-8 text-slate-200 sm:text-base">
            We aim to reduce confusion, improve consistency, and make learning
            workflows easier to follow. From courses to quizzes to performance
            tracking, every part should support better preparation without
            unnecessary complexity.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

export default About;