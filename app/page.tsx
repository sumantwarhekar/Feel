"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import styles from "@/styles/landing.module.css";

/* ── Floating orb / blob backgrounds ───────────────────── */
function HeroOrbs() {
  return (
    <div className="pointer-events-none" aria-hidden>
      {/* large green blob top-right */}
      <motion.div
        className={`blob-anim ${styles.orbLarge}`}
        animate={{ scale: [1, 1.06, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* medium teal blob bottom-left */}
      <motion.div
        className={`blob-anim ${styles.orbMedium}`}
        animate={{ scale: [1, 1.1, 0.95, 1], rotate: [0, -8, 4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* small accent mid-right */}
      <motion.div
        className={styles.orbSmall}
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
          className={styles.emojiBubbleBase}
          style={{
            ...pos,
            width: size,
            height: size,
            fontSize: size * 0.55,
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
      className={`hero ${styles.minH100vh}`}
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
          className={styles.heroPill}
        >
          <span className={styles.heroPillInner}>
            <span className={`pulse-green ${styles.heroPillDot}`} />
            Your daily mindfulness companion
          </span>
        </motion.div>

        {/* main headline */}
        <motion.h1
          className={`font-display ${styles.heroH1}`}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .75, delay: .2, ease: [.22, 1, .36, 1] }}
        >
          <span className="text-gradient-shimmer">Feel</span>
        </motion.h1>

        {/* sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .35, ease: [.22, 1, .36, 1] }}
          className={styles.heroSubtext}
        >
          One sentence. One emotion. One memory – captured for eternity.{" "}
          <strong className={styles.heroSubtextBold}>
            Build a journaling habit that actually sticks
          </strong>{" "}
          with daily micro-entries, mood tracking, and beautiful insights.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .65, delay: .5 }}
          className={styles.heroActions}
        >
          <Link href="/register" className={`btn-primary ${styles.heroBtnPrimary}`}>
            Start for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/login" className={`btn-outline ${styles.heroBtnOutline}`}>
            Sign in
          </Link>
        </motion.div>

        {/* social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .9, duration: .6 }}
          className={styles.heroLoginPrompt}
        >
          No credit card required · Free forever
        </motion.p>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className={styles.scrollCueWrapper}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className={styles.scrollCueInner}
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
      <div className={styles.featureCardIconContainer}>
        {icon}
      </div>
      <h3 className={styles.featureCardTitle}>
        {title}
      </h3>
      <p className={styles.featureCardDesc}>
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
      className={styles.featuresSection}
    >
      <div className={styles.container1200}>
        {/* heading */}
        <div ref={ref} className={styles.sectionHeader}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .5 }}
            className={styles.eyebrow}
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .6, delay: .1 }}
            className={`font-display ${styles.h2Title}`}
          >
            Built for real <span className="text-gradient">daily habit</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: .6, delay: .2 }}
            className={styles.h2Desc}
          >
            Powerful features kept intentionally simple so they don't get in your way.
          </motion.p>
        </div>

        {/* grid */}
        <div className={styles.featuresGrid}>
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
      className={styles.moodSection}
    >
      <div ref={ref} className={styles.container960}>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .5 }}
          className={styles.eyebrow}
        >
          Mood tracking
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .65, delay: .1 }}
          className={`font-display ${styles.h2Title}`}
        >
          How are you <span className="text-gradient">feeling</span> today?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: .6, delay: .2 }}
          className={styles.h2Desc}
        >
          Tag your daily entry with one of five moods. Watch patterns emerge over time.
        </motion.p>

        {/* mood pills */}
        <div className={styles.moodGrid}>
          {MOODS.map(({ emoji, label, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: .8, y: 20 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: .5, delay: .3 + i * .07, ease: [.22, 1, .36, 1] }}
              whileHover={{ scale: 1.08, y: -4 }}
              className={styles.moodPill}
              style={{
                background: bg,
                border: `2px solid ${color}30`,
              }}
              onHoverStart={(e) => {
                (e.target as HTMLElement).style.boxShadow = `0 12px 32px ${color}30`;
              }}
              onHoverEnd={(e) => {
                (e.target as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span className={styles.moodEmoji}>{emoji}</span>
              <span className={styles.moodLabel} style={{ color }}>{label}</span>
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
      className={styles.statsSection}
    >
      {/* bg decoration */}
      <div aria-hidden className={styles.statsBgOrb1} />
      <div aria-hidden className={styles.statsBgOrb2} />

      <div ref={ref} className={styles.statsContainer}>
        {/* stats row */}
        <div className={styles.statsGrid}>
          {STATS.map(({ value, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: .6, delay: i * .1 }}
              className={styles.statItem}
            >
              <p className={`font-display ${styles.statNumber}`}>
                {value}
                <span className={styles.statSuffix}>
                  {suffix}
                </span>
              </p>
              <p className={styles.statLabel}>
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
          className={styles.statsCta}
        >
          <h2 className={`font-display ${styles.statsCtaTitle}`}>
            Ready to start feeling?
          </h2>
          <p className={styles.statsCtaDesc}>
            Join countless others forming the daily practice of mindfulness - line by line.
          </p>
          <Link
            href="/register"
            className={`btn-primary ${styles.statsCtaBtn}`}
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
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLogoWrap}>
          <div className={styles.footerLogoIcon}>
            🌿
          </div>
          <span className={styles.footerLogoText}>
            Feel
          </span>
        </div>
        <p className={styles.footerCopy}>
          © 2026 Feel. Built with 💚 for CS 555
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
