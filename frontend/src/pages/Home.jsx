import { Link } from "react-router";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const MotionLink = motion.create(Link);

/* ---------- Lenis smooth scroll driver ---------- */
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => lenis.destroy();
  }, []);
}

/* ---------- GSAP character-split heading reveal ---------- */
function SplitHeading({ text, className = "" }) {
  const ref = useRef(null);

  useGSAP(() => {
    const split = new SplitText(ref.current, {
      type: "words, chars",
      wordsClass: "inline-block whitespace-nowrap",
    });

    gsap.from(split.chars, {
      opacity: 0,
      y: 60,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: { trigger: ref.current, start: "top 85%" },
    });

    return () => split.revert();
  }, []);

  return (
    <h2 ref={ref} className={className}>
      {text}
    </h2>
  );
}

/* ---------- Animated Counter ---------- */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  return (
    <motion.p
      className="text-4xl font-bold text-[#46637f] transition-colors duration-300 group-hover:text-[#2c4058]"
      onViewportEnter={() => {
        let start = 0;
        const inc = target / (1400 / 16);
        const t = setInterval(() => {
          start += inc;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 16);
      }}
      viewport={{ once: true, amount: 0.5 }}
    >
      {count}{suffix}
    </motion.p>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Magnetic spring button ---------- */
function MagneticButton({ children, className = "", to }) {
  const btnRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  return (
    <MotionLink
      to={to}
      ref={btnRef}
      onMouseMove={(e) => {
        const r = btnRef.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.4);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.94 }}
      className={className}
    >
      {children}
    </MotionLink>
  );
}

/* ---------- GSAP horizontal marquee (replaces CSS keyframe) ---------- */
function GsapMarquee({ items }) {
  const trackRef = useRef(null);
  useGSAP(() => {
    const el = trackRef.current;
    const width = el.scrollWidth / 2;
    gsap.to(el, { x: -width, duration: 25, ease: "none", repeat: -1 });
  }, []);
  return (
    <div className="overflow-hidden border-b border-[#d8e0e7] bg-white py-4">
      <div ref={trackRef} className="flex w-max gap-16 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-[#8a97a3]">
        {[...items, ...items].map((text, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#46637f]" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function Home() {
  useLenis();

  const heroRef = useRef(null);
  const mvX = useMotionValue(50);
  const mvY = useMotionValue(50);
  const glowX = useSpring(mvX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(mvY, { stiffness: 60, damping: 20 });

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const statsRef = useRef(null);
  useGSAP(() => {
    gsap.from(".stat-card", {
      opacity: 0,
      y: 60,
      scale: 0.9,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
    });
  }, []);

  const ctaRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      ctaRef.current,
      { scale: 0.92, opacity: 0.6 },
      {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: ctaRef.current, start: "top 90%", end: "top 40%", scrub: true },
      }
    );
  }, []);

  const marqueeItems = ["JEE Mains & Advanced", "NEET Preparation", "Scholarship Tests", "Weekly Mock Exams", "Doubt Clearing Sessions", "Personalized Reports"];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f5f7] text-[#1f2937]">
      {/* HERO */}
      <section
        ref={heroRef}
        onMouseMove={(e) => {
          const r = heroRef.current.getBoundingClientRect();
          mvX.set(((e.clientX - r.left) / r.width) * 100);
          mvY.set(((e.clientY - r.top) / r.height) * 100);
        }}
        className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,14,20,0.75) 0%, rgba(17,24,39,0.55) 45%, rgba(17,24,39,0.85) 100%), url('/image.jpg')",
        }}
      >
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="absolute inset-0" />
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: useTransform([glowX, glowY], ([gx, gy]) => `radial-gradient(600px circle at ${gx}% ${gy}%, rgba(143,179,217,0.25), transparent 60%)`) }}
        />

        <motion.div animate={{ y: [0, -25, 0], x: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-[#8fb3d9]/20 blur-3xl" />
        <motion.div animate={{ y: [0, -30, 0], x: [0, -20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute right-[15%] top-[55%] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute bottom-[10%] left-[35%] h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative mx-auto flex min-h-screen max-w-[1320px] items-center px-6 pt-28 pb-14 sm:pt-32 lg:px-10">
          <div className="max-w-3xl">
            <motion.span initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Admissions open for 2026 batch
            </motion.span>

           <SplitHeading
              text="Structured coaching for students with serious goals"
              className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl [text-wrap:balance]"
            />

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              Prepare for JEE and NEET with better clarity, stronger practice, and regular guided testing.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="mt-9 flex flex-wrap gap-4">
              <MagneticButton to="/courses" className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-[#1f2937] shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#e8edf1]">
                Explore Courses <span>→</span>
              </MagneticButton>
              <MagneticButton to="/enquire" className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15">
                Enquire Now
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60">
          <div className="h-9 w-6 rounded-full border-2 border-white/40 p-1">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="mx-auto h-2 w-1.5 rounded-full bg-white/70" />
          </div>
        </motion.div>
      </section>

      <GsapMarquee items={marqueeItems} />

      {/* ONLINE SUPPORT */}
      <section className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="flex justify-center lg:justify-start">
            <motion.div whileHover={{ y: -8, rotate: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-[#46637f]/20 to-transparent blur-2xl" />
              <img src="/image-2.jpg" alt="Online learning support" className="h-auto w-full max-w-[420px] rounded-2xl object-contain shadow-xl" />
            </motion.div>
          </Reveal>
          <Reveal delay={0.15}>
            <span className="inline-block rounded-full bg-[#46637f]/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#46637f]">Online Support</span>
            <SplitHeading text="Learn from anywhere without losing guidance" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" />
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6b76] sm:text-lg">Online support helps students continue lessons, practice plans, and revision even when they need more flexibility in their daily schedule.</p>
          </Reveal>
        </div>
      </section>

      {/* STUDENT FOCUS */}
      <section className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10">
        <div className="grid items-center gap-12 border-t border-[#d8e0e7] pt-14 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <span className="inline-block rounded-full bg-[#46637f]/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#46637f]">Student Focus</span>
            <SplitHeading text="Better results come from routine and consistency" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" />
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6b76] sm:text-lg">Good preparation needs regular study, enough question practice, and honest review. We try to create that system for every student.</p>
          </Reveal>
          <Reveal delay={0.15} className="flex justify-center lg:justify-end">
            <motion.div whileHover={{ y: -8, rotate: -1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-[#46637f]/20 to-transparent blur-2xl" />
              <img src="/image-3.jpg" alt="Students with laptop and books" className="h-auto w-full max-w-[500px] rounded-2xl object-contain shadow-xl" />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* OFFLINE LEARNING */}
      <section className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10">
        <div className="grid items-center gap-12 border-t border-[#d8e0e7] pt-14 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="flex justify-center lg:justify-start">
            <motion.div whileHover={{ y: -8, rotate: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-[#46637f]/20 to-transparent blur-2xl" />
              <img src="/image-4.jpg" alt="Students studying with books" className="h-auto w-full max-w-[500px] rounded-2xl object-contain shadow-xl" />
            </motion.div>
          </Reveal>
          <Reveal delay={0.15}>
            <span className="inline-block rounded-full bg-[#46637f]/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#46637f]">Offline Learning</span>
            <SplitHeading text="Strong classroom learning still matters" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" />
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6b76] sm:text-lg">Offline study gives students a more stable environment, direct support, and the discipline needed for long-term exam preparation.</p>
          </Reveal>
        </div>
      </section>

      {/* TEST PRACTICE CTA */}
      <section className="mx-auto max-w-[1320px] px-6 pb-16 pt-10 lg:px-10">
        <div ref={ctaRef} className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#46637f] via-[#3d5670] to-[#2c4058] text-white shadow-2xl">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative grid gap-10 px-8 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-16">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Test Practice</span>
              <SplitHeading text="Take a Test and check where your preparation really stands" className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl" />
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">Practice regularly, identify weak areas, and build more confidence before the real exam through guided Test sessions.</p>
            </div>
            <div className="flex flex-col justify-between gap-8 border-t border-white/20 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/65">Quick Access</p>
                <p className="mt-3 text-lg leading-8 text-white/85">Begin with a short practice set or move into a more focused test round.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <MagneticButton to="/quiz" className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#46637f] shadow-lg transition-colors hover:bg-[#e8edf1]">
                  Start Test <span>→</span>
                </MagneticButton>
                <MagneticButton to="/enquire" className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10">
                  Need Guidance
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="mx-auto max-w-[1320px] px-6 pb-16 lg:px-10">
        <div className="grid gap-6 border-t border-[#d8e0e7] pt-14 md:grid-cols-3">
          {[
            { target: 500, suffix: "+ Students Guided", desc: "Students guided through structured learning and specialized preparation for targeted exams." },
            { target: 50, suffix: "+ Tests And Quiz", desc: "Tests and practice Quiz designed to improve revision and test the students capabilities to provide scholarships." },
            { target: 10, suffix: "+ Entrance Exams", desc: "Focused preparation support for students aiming at competitive exams and Entrance Exams." },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }} transition={{ type: "spring", stiffness: 250, damping: 18 }} className="stat-card group rounded-2xl border border-[#e2e8ee] bg-white p-7 shadow-sm">
              <Counter target={item.target} suffix={item.suffix} />
              <p className="mt-3 text-base leading-7 text-[#5f6b76]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* EXAM FOCUS + GUIDANCE */}
      <section className="mx-auto max-w-[1320px] px-6 pb-20 lg:px-10">
        <div className="grid gap-10 border-t border-[#d8e0e7] pt-14 lg:grid-cols-2">
          <Reveal>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="rounded-2xl border border-[#e2e8ee] bg-white p-8 shadow-sm">
              <span className="inline-block rounded-full bg-[#46637f]/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#46637f]">Exam Focus</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Preparation needs clarity, practice, and review</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6b76] sm:text-lg">Students often study hard but without enough feedback. Regular tests, quiz practice, and course structure make it easier to see progress and improve weak areas on time.</p>
            </motion.div>
          </Reveal>
          <Reveal delay={0.15}>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="rounded-2xl bg-gradient-to-br from-[#46637f] to-[#2c4058] p-8 text-white shadow-sm">
              <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Guidance</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Not sure where to begin?</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">If you are confused about the right course, batch, or level of practice, use the enquiry page and we can guide you based on your current stage of preparation.</p>
              <MagneticButton to="/enquire" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#46637f] transition-colors hover:bg-[#e8edf1]">
                Go to Enquiry →
              </MagneticButton>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default Home;