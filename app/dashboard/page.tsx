"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEntries, type MoodId } from "@/lib/hooks/useEntries";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import styles from "@/styles/dashboard.module.css";

/* ── Mood options ───────────────────────────────────────── */
const MOODS = [
  { id: "great",   emoji: "😄", label: "Great"   },
  { id: "good",    emoji: "🙂", label: "Good"    },
  { id: "meh",     emoji: "😐", label: "Meh"     },
  { id: "bad",     emoji: "😔", label: "Bad"     },
  { id: "awful",   emoji: "😞", label: "Awful"   },
];

const MAX_CHARS = 280;

/* ── Panel transition ───────────────────────────────────── */
const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

/* ════════════════════════════════════════════════════════════
   Tab Panels
   ════════════════════════════════════════════════════════════ */

/* ── Today ── */
function TodayPanel() {
  const { user } = useAuth();
  const { todayEntry, streak, loading, saving, saveEntry } = useEntries();
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const remaining = MAX_CHARS - text.length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const handleSubmit = async () => {
    if (!text.trim() || !mood || remaining < 0) return;
    await saveEntry(text, mood as MoodId);
  };

  if (loading) {
    return (
      <motion.div key="loading" {...panelVariants} transition={{ duration: 0.4 }}>
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>⏳</div>
          <p className={styles.emptySubtext}>Loading…</p>
        </div>
      </motion.div>
    );
  }

  if (todayEntry) {
    return (
      <motion.div key="submitted" {...panelVariants} transition={{ duration: 0.4 }}>
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>✅</div>
          <h2 className={styles.emptyTitle}>Entry saved!</h2>
          <p className={styles.emptySubtext}>
            Great job writing today. Come back tomorrow to keep your streak going.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="today" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>{greeting}, {firstName}!</h1>
      <p className={styles.sectionSubtext}>How was your day? Write one line.</p>

      <span className={styles.streakBadge}>
        {streak > 0 ? `🔥 ${streak}-day streak — keep it up!` : "🔥 0-day streak — start today!"}
      </span>

      {/* Entry textarea */}
      <div className={styles.entryCard}>
        <textarea
          id="journal-entry"
          className={styles.entryTextarea}
          placeholder="One honest line about your day…"
          value={text}
          maxLength={MAX_CHARS + 10}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className={styles.entryFooter}>
          <span className={`${styles.charCount} ${remaining < 0 ? styles.charCountOver : ""}`}>
            {remaining} characters left
          </span>
          <motion.button
            id="save-entry-btn"
            className={`btn-primary ${styles.saveBtn}`}
            onClick={handleSubmit}
            disabled={!text.trim() || !mood || remaining < 0 || saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? "Saving…" : "Save entry"}
          </motion.button>
        </div>
      </div>

      {/* Mood picker */}
      <div className={styles.moodCard}>
        <p className={styles.moodLabel}>How are you feeling? 🌡️</p>
        <div className={styles.moodGrid}>
          {MOODS.map((m) => (
            <motion.button
              key={m.id}
              id={`mood-${m.id}`}
              className={`${styles.moodBtn} ${mood === m.id ? styles.moodActive : ""}`}
              onClick={() => setMood(m.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={styles.moodEmoji}>{m.emoji}</span>
              <span className={styles.moodText}>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Timeline ── */
function TimelinePanel() {
  return (
    <motion.div key="timeline" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Timeline</h1>
      <p className={styles.sectionSubtext}>All your entries, most recent first.</p>
      <div className={styles.emptyState}>
        <div className={styles.emptyEmoji}>📋</div>
        <h2 className={styles.emptyTitle}>No entries yet</h2>
        <p className={styles.emptySubtext}>
          Write your first entry on the Today tab. Every line you write shows up here.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Calendar ── */
function CalendarPanel() {
  return (
    <motion.div key="calendar" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Calendar</h1>
      <p className={styles.sectionSubtext}>Your journaling streak at a glance.</p>
      <div className={styles.emptyState}>
        <div className={styles.emptyEmoji}>📅</div>
        <h2 className={styles.emptyTitle}>Streak calendar coming soon</h2>
        <p className={styles.emptySubtext}>
          Write a few entries and your consistency heatmap will appear here.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Stats ── */
function StatsPanel() {
  return (
    <motion.div key="stats" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Stats</h1>
      <p className={styles.sectionSubtext}>Mood trends and journaling insights.</p>
      <div className={styles.emptyState}>
        <div className={styles.emptyEmoji}>📊</div>
        <h2 className={styles.emptyTitle}>No data yet</h2>
        <p className={styles.emptySubtext}>
          Stats and mood trends will appear here once you&apos;ve logged a few entries.
        </p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════
   Dashboard Page
   ════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("today");

  const renderPanel = () => {
    switch (activeTab) {
      case "today":    return <TodayPanel />;
      case "timeline": return <TimelinePanel />;
      case "calendar": return <CalendarPanel />;
      case "stats":    return <StatsPanel />;
      default:         return <TodayPanel />;
    }
  };

  return (
    <div className={styles.shell}>
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={styles.tabContent}>
        <AnimatePresence mode="wait">
          {renderPanel()}
        </AnimatePresence>
      </main>
    </div>
  );
}
