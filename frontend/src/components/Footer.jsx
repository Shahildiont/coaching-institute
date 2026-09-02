import { Link, useLocation } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MagneticLink = motion.create(Link);

function ScrollToTopLink({ to, children, className }) {
  const location = useLocation();

  function handleClick() {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link to={to} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

function MotionScrollToTopLink({ to, children, className, onMouseMove, onMouseLeave, style, whileTap }) {
  const location = useLocation();

  function handleClick() {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <MagneticLink
      to={to}
      onClick={handleClick}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={style}
      whileTap={whileTap}
    >
      {children}
    </MagneticLink>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Footer() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    { to: "/quiz", label: "Quiz" },
    { to: "/about", label: "About" },
    { to: "/enquire", label: "Enquire" },
  ];

  return (
    <footer className="mt-20 w-full overflow-hidden bg-[#10233b] text-white">
      {/* HERO / CTA STRIP */}
      <section
        ref={heroRef}
        className="relative min-h-[360px] overflow-hidden bg-cover bg-center bg-no-repeat"
      >
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
          initial={false}
          {...{
            style: {
              y: bgY,
              backgroundImage:
                "linear-gradient(rgba(16, 35, 59, 0.72), rgba(16, 35, 59, 0.74)), url('/groupp.jpg')",
            },
          }}
        />

        <div className="absolute inset-0 bg-[#10233b]/20" />
        <div className="absolute bottom-0 left-0 top-0 w-24 bg-gradient-to-r from-[#10233b] via-[#10233b]/70 to-transparent sm:w-32" />

        {/* floating ambient glow */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-[10%] top-[20%] h-48 w-48 rounded-full bg-[#46637f]/20 blur-3xl"
        />

        <div className="relative mx-auto flex min-h-[360px] max-w-[1320px] items-end px-6 py-12 lg:px-10 lg:py-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="max-w-2xl"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
            >
              Start building a stronger preparation journey with the right
              guidance
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-5 max-w-xl text-base leading-8 text-white/80 sm:text-lg"
            >
              Join a learning environment focused on clarity, practice, and
              regular evaluation for serious exam preparation.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-wrap gap-4"
            >
              <MagneticCTA to="/enquire" primary>
                Enquire Now
              </MagneticCTA>

              <MagneticCTA to="/courses">
                Explore Courses
              </MagneticCTA>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* LINKS SECTION */}
      <section className="w-full bg-[#10233b]">
        <div className="mx-auto max-w-[1320px] px-6 py-10 lg:px-10 lg:py-12">
          <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_1fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="text-2xl font-semibold">XYZ Institution</h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
                A place for disciplined preparation, guided learning, and
                regular quiz-based practice for students aiming higher.
              </p>

              <div className="mt-6 space-y-2 text-sm text-white/75">
                <p>Learn • Practice • Succeed</p>
                <p>support@xyzinstitution.com</p>
                <p>+91 98765 43210</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
                QuickLinks
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                {quickLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  >
                    <ScrollToTopLink
                      to={link.to}
                      className="inline-block transition-colors hover:text-white"
                    >
                      <motion.span
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="inline-block"
                      >
                        {link.label}
                      </motion.span>
                    </ScrollToTopLink>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
                Support
              </p>

              <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                Talk to us for course guidance, batch details, and help
                choosing the right preparation path.
              </p>

              <MagneticCTA to="/enquire" primary className="mt-5 inline-flex text-sm">
                Request a Callback
              </MagneticCTA>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>© 2026 XYZ Institution. All rights reserved.</p>
            <p>Built for clear learning and better preparation.</p>
          </motion.div>
        </div>
      </section>
    </footer>
  );
}

function MagneticCTA({ to, children, primary = false, className = "" }) {
  const location = useLocation();

  function handleClick() {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const base = primary
    ? "rounded-xl bg-[#46637f] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#395269]"
    : "rounded-xl border border-white/35 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10";

  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Link to={to} onClick={handleClick} className={`${base} ${className} inline-block`}>
        {children}
      </Link>
    </motion.div>
  );
}

export default Footer;