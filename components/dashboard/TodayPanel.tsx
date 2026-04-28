"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import {
  saveEntry,
  getTodayEntry,
  getUserStreak,
} from "@/lib/firebase/journal";
import type { JournalEntry } from "@/lib/firebase/journal";
import styles from "@/styles/dashboard.module.css";

const MOODS = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "meh", emoji: "😐", label: "Meh" },
  { id: "bad", emoji: "😔", label: "Bad" },
  { id: "awful", emoji: "😞", label: "Awful" },
];

const MAX_CHARS = 280;

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function TodayPanel() {
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_CHARS - text.length;
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    if (!user) return;
    Promise.all([getTodayEntry(user.uid), getUserStreak(user.uid)])
      .then(([entry, s]) => {
        if (entry) {
          setTodayEntry(entry);
          setSubmitted(true);
        }
        setStreak(s);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async () => {
    if (!text.trim() || !mood || remaining < 0 || !user) return;
    setSaving(true);
    setError(null);
    try {
      await saveEntry(user.uid, text.trim(), mood);
      setStreak((s) => s + 1);
      setSubmitted(true);
    } catch {
      setError("Couldn't save your entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  if (submitted) {
    return (
      <motion.div
        key="submitted"
        {...panelVariants}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>✅</div>
          <h2 className={styles.emptyTitle}>Entry saved!</h2>
          <p className={styles.emptySubtext}>
            {todayEntry
              ? "You already wrote today. Come back tomorrow!"
              : "Great job writing today. Come back tomorrow to keep your streak going."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="today" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>
        {greeting}, {firstName}!
      </h1>
      <p className={styles.sectionSubtext}>How was your day? Write one line.</p>

      <span className={styles.streakBadge}>
        {streak > 0
          ? `🔥 ${streak}-day streak!`
          : "🔥 0-day streak — start today!"}
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
          <span
            className={`${styles.charCount} ${remaining < 0 ? styles.charCountOver : ""}`}
          >
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
        {error && (
          <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: 8 }}>
            {error}
          </p>
        )}
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
