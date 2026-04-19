"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

/* ── Floating orb / blob backgrounds ───────────────────── */
function HeroOrbs() {
  return (
    <div className="pointer-events-none" aria-hidden>
      {/* large green blob top-right */}
      <motion.div
        className="blob-anim"
        style={{
          position: "absolute",
          top: "-120px",
          right: "-100px",
          width: 480,
          height: 480,
          background:
            "radial-gradient(circle, rgba(74,222,128,.22) 0%, rgba(34,197,94,.08) 60%, transparent 100%)",
          filter: "blur(1px)",
        }}
        animate={{ scale: [1, 1.06, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* medium teal blob bottom-left */}
      <motion.div
        className="blob-anim"
        style={{
          position: "absolute",
          bottom: "80px",
          left: "-80px",
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(134,239,172,.18) 0%, rgba(74,222,128,.06) 60%, transparent 100%)",
          filter: "blur(2px)",
          animationDelay: "3s",
        }}
        animate={{ scale: [1, 1.1, 0.95, 1], rotate: [0, -8, 4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* small accent mid-right */}
      <motion.div
        style={{
          position: "absolute",
          top: "35%",
          right: "8%",
          width: 160,
          height: 160,
          background:
            "radial-gradient(circle, rgba(34,197,94,.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
        animate={{ y: [-16, 16, -16], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Floating emoji bubbles ─────────────────────────────── */
const EMOJI_BUBBLES = [
  { emoji: "✨", top: "20%", left: "8%", delay: 0, size: 48 },
  { emoji: "🌿", top: "60%", left: "5%", delay: 1.2, size: 44 },
  { emoji: "💚", top: "15%", right: "9%", delay: 0.6, size: 42 },
  { emoji: "📝", top: "72%", right: "7%", delay: 1.8, size: 46 },
  { emoji: "🌱", top: "40%", left: "3%", delay: 2.2, size: 38 },
  { emoji: "⭐", top: "30%", right: "4%", delay: 0.9, size: 36 },
];

function FloatingEmojis() {
  return (
    <div className="pointer-events-none" aria-hidden>
      {EMOJI_BUBBLES.map(({ emoji, delay, size, ...pos }, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.55,
            background: "rgba(255,255,255,.8)",
            backdropFilter: "blur(8px)",
            borderRadius: "50%",
            boxShadow: "0 4px 20px rgba(0,0,0,.08)",
            border: "1px solid rgba(255,255,255,.9)",
          }}
          animate={{ y: [0, -20, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Hero section ───────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="today"
      className="hero"
      style={{ minHeight: "100vh" }}
    >
      <div className="hero-bg" />
      <HeroOrbs />
      <FloatingEmojis />

      <div className="hero-content">
        {/* pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, delay: .1 }}
          style={{ display: "inline-flex", marginBottom: 28 }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              background: "rgba(34,197,94,.1)",
              border: "1px solid rgba(34,197,94,.25)",
              borderRadius: "9999px",
              fontSize: ".8125rem",
              fontWeight: 600,
              color: "var(--green-700)",
              letterSpacing: ".04em",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-500)", display: "inline-block" }} className="pulse-green" />
            Your daily mindfulness companion
          </span>
        </motion.div>

        {/* main headline */}
        <motion.h1
          className="font-display"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .75, delay: .2, ease: [.22, 1, .36, 1] }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(4rem, 10vw, 8rem)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-.03em",
            marginBottom: 24,
          }}
        >
          <span className="text-gradient-shimmer">Feel</span>
        </motion.h1>

        {/* sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .35, ease: [.22, 1, .36, 1] }}
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
            color: "var(--gray-600)",
            maxWidth: 560,
            margin: "0 auto 40px",
            lineHeight: 1.65,
          }}
        >
          One sentence. One emotion. One memory – captured for eternity.{" "}
          <strong style={{ color: "var(--gray-800)", fontWeight: 600 }}>
            Build a journaling habit that actually sticks
          </strong>{" "}
          with daily micro-entries, mood tracking, and beautiful insights.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65, delay: .5 }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/register" className="btn-primary" style={{ fontSize: "1rem", padding: "16px 36px" }}>
            Start for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/login" className="btn-outline" style={{ fontSize: "1rem", padding: "16px 36px" }}>
            Sign in
          </Link>
        </motion.div>

        {/* social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .9, duration: .6 }}
          style={{ marginTop: 28, fontSize: ".85rem", color: "var(--gray-400)" }}
        >
          No credit card required · Free forever
        </motion.p>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)" }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "var(--gray-400)",
            fontSize: ".75rem",
            letterSpacing: ".06em",
            textTransform: "uppercase",
          }}
        >
          <span>Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── Feature card ───────────────────────────────────────── */
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: .6, delay, ease: [.22, 1, .36, 1] }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--green-50), var(--green-100))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          marginBottom: 20,
          border: "1px solid var(--green-200)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "var(--gray-900)",
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--gray-500)", fontSize: ".9375rem", lineHeight: 1.65 }}>
        {description}
      </p>
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: "📝",
    title: "One line a day",
    description: "Just 280 characters. No pressure. Capture what matters most before the day slips away.",
  },
  {
    icon: "😊",
    title: "Mood tracking",
    description: "Tag each entry with how you felt. See patterns emerge over weeks and months.",
  },
  {
    icon: "📅",
    title: "Consistency calendar",
    description: "A GitHub-style heatmap shows your journaling streak and keeps you motivated.",
  },
  {
    icon: "📊",
    title: "Insights dashboard",
    description: "Mood frequency charts, current streaks, and personal milestones at a glance.",
  },
  {
    icon: "🔍",
    title: "Keyword search",
    description: "Find any past entry instantly. Search by word, mood, or date range.",
  },
  {
    icon: "📤",
    title: "Data export",
    description: "Your data is yours. Export your full journal to PDF or plain text anytime.",
  },
];

/* ── Features section ───────────────────────────────────── */
function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="timeline"
      style={{ padding: "120px 24px", background: "var(--off-white)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* heading */}
        <div ref={ref} style={{ textAlign: "center", marginBottom: 72 }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .5 }}
            style={{
              fontSize: ".875rem",
              fontWeight: 600,
              color: "var(--green-600)",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .6, delay: .1 }}
            className="font-display"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "var(--gray-900)",
              letterSpacing: "-.02em",
              lineHeight: 1.15,
              maxWidth: 520,
              margin: "0 auto 20px",
            }}
          >
            Built for real <span className="text-gradient">daily habit</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .6, delay: .2 }}
            style={{ color: "var(--gray-500)", fontSize: "1.05rem", maxWidth: 460, margin: "0 auto" }}
          >
            Powerful features kept intentionally simple so they don't get in your way.
          </motion.p>
        </div>

        {/* grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Mood showcase section ──────────────────────────────── */
const MOODS = [
  { emoji: "😄", label: "Great", color: "#22c55e", bg: "#f0fdf4" },
  { emoji: "🙂", label: "Good", color: "#84cc16", bg: "#f7fee7" },
  { emoji: "😐", label: "Okay", color: "#eab308", bg: "#fefce8" },
  { emoji: "😔", label: "Low", color: "#f97316", bg: "#fff7ed" },
  { emoji: "😢", label: "Rough", color: "#ef4444", bg: "#fef2f2" },
];

function MoodSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="calendar"
      style={{
        padding: "120px 24px",
        background: "linear-gradient(180deg, white 0%, var(--green-50) 100%)",
      }}
    >
      <div ref={ref} style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .5 }}
          style={{
            fontSize: ".875rem",
            fontWeight: 600,
            color: "var(--green-600)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Mood tracking
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .65, delay: .1 }}
          className="font-display"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 800,
            color: "var(--gray-900)",
            letterSpacing: "-.02em",
            marginBottom: 20,
          }}
        >
          How are you <span className="text-gradient">feeling</span> today?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .6, delay: .2 }}
          style={{ color: "var(--gray-500)", fontSize: "1.05rem", marginBottom: 56 }}
        >
          Tag your daily entry with one of five moods. Watch patterns emerge over time.
        </motion.p>

        {/* mood pills */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {MOODS.map(({ emoji, label, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: .8, y: 20 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: .5, delay: .3 + i * .07, ease: [.22, 1, .36, 1] }}
              whileHover={{ scale: 1.08, y: -4 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "24px 28px",
                background: bg,
                border: `2px solid ${color}30`,
                borderRadius: 20,
                cursor: "pointer",
                transition: "box-shadow .25s ease",
              }}
              onHoverStart={(e) => {
                (e.target as HTMLElement).style.boxShadow = `0 12px 32px ${color}30`;
              }}
              onHoverEnd={(e) => {
                (e.target as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: 40 }}>{emoji}</span>
              <span style={{ fontWeight: 600, fontSize: ".9rem", color }}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats / CTA section ────────────────────────────────── */
function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const STATS = [
    { value: "280", suffix: "chars", label: "All you need per day" },
    { value: "365", suffix: "days", label: "Build a year-long streak" },
    { value: "5", suffix: "moods", label: "Capture every emotion" },
    { value: "∞", suffix: "", label: "Entries, free forever" },
  ];

  return (
    <section
      id="stats"
      style={{
        padding: "120px 24px",
        background: "linear-gradient(135deg, var(--green-600) 0%, var(--green-800) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* bg decoration */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(255,255,255,.05)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(255,255,255,.04)",
        }}
      />

      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
            marginBottom: 80,
          }}
        >
          {STATS.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: .6, delay: i * .1 }}
              style={{ textAlign: "center" }}
            >
              <p
                className="font-display"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {value}
                <span style={{ fontSize: "1.2rem", fontWeight: 500, opacity: .7, marginLeft: 4 }}>
                  {suffix}
                </span>
              </p>
              <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".9375rem", marginTop: 8 }}>
                {label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .65, delay: .5 }}
          style={{ textAlign: "center" }}
        >
          <h2
            className="font-display"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-.02em",
              marginBottom: 16,
            }}
          >
            Ready to start feeling?
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: "1.05rem", marginBottom: 36 }}>
            Join countless others forming the daily practice of mindfulness - line by line.
          </p>
          <Link
            href="/register"
            className="btn-primary"
            style={{
              background: "white",
              color: "var(--green-700)",
              fontSize: "1rem",
              padding: "16px 40px",
              boxShadow: "0 8px 32px rgba(0,0,0,.2)",
            }}
          >
            Create your free account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: "var(--gray-900)", padding: "48px 24px" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--green-400), var(--green-600))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🌿
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "white", fontSize: "1.05rem" }}>
            Feel
          </span>
        </div>
        <p style={{ color: "var(--gray-500)", fontSize: ".875rem" }}>
          © 2026 Feel. Built with 💚 for CS 555.
        </p>
      </div>
    </footer>
  );
}

/* ── Page root ──────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MoodSection />
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
