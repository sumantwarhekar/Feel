"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import styles from "@/styles/dashboard.module.css";
import {
  saveEntry,
  getUserStreak,
  getTodayEntry,
  type Mood,
  type JournalEntry,
} from "@/lib/firebase/entries";

const MOODS = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good",  emoji: "🙂", label: "Good"  },
  { id: "meh",   emoji: "😐", label: "Meh"   },
  { id: "bad",   emoji: "😔", label: "Bad"   },
  { id: "awful", emoji: "😞", label: "Awful" },
];

const MAX_CHARS = 280;

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function TodayPanel() {
  const { user } = useAuth();
  const [text, setText]               = useState("");
  const [mood, setMood]               = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [streak, setStreak]           = useState(0);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const remaining = MAX_CHARS - text.length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.allSettled([
      getUserStreak(user.uid),
      getTodayEntry(user.uid),
    ]).then(([streakResult, entryResult]) => {
      if (cancelled) return;
      if (streakResult.status === "fulfilled") {
        setStreak(streakResult.value);
      }
      if (entryResult.status === "fulfilled" && entryResult.value) {
        setText((entryResult.value as JournalEntry).text);
        setMood((entryResult.value as JournalEntry).mood);
        setSubmitted(true);
      }
    }).finally(() => {
      if (!cancelled) setInitLoading(false);
    });

    return () => { cancelled = true; };
  }, [user]);

  const handleSubmit = async () => {
    if (!text.trim() || !mood || remaining < 0 || !user) return;
    setSaving(true);
    setSaveError(null);
    try {
      const newStreak = await saveEntry(user.uid, text, mood as Mood);
      setStreak(newStreak);
      setSubmitted(true);
    } catch {
      setSaveError("Couldn't save your entry. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (initLoading) return null;

  if (submitted) {
    return (
      <motion.div key="submitted" {...panelVariants} transition={{ duration: 0.4 }}>
        <h1 className={styles.sectionHeading}>{greeting}, {firstName}!</h1>
        <p className={styles.sectionSubtext}>You&apos;ve already written today. ✓</p>

        <span className={styles.streakBadge}>
          🔥 {streak > 0 ? `${streak}-day streak!` : "0-day streak — start today!"}
        </span>

        <div className={styles.entryCard}>
          <p className={styles.entryDoneText}>{text}</p>
        </div>

        <div className={styles.moodCard}>
          <p className={styles.moodLabel}>Today&apos;s mood 🌡️</p>
          <div className={styles.moodGrid}>
            {MOODS.map((m) => (
              <div
                key={m.id}
                className={`${styles.moodBtn} ${mood === m.id ? styles.moodActive : ""} ${styles.moodReadOnly}`}
              >
                <span className={styles.moodEmoji}>{m.emoji}</span>
                <span className={styles.moodText}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="today" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>{greeting}, {firstName}!</h1>
      <p className={styles.sectionSubtext}>How was your day? Write one line.</p>

      <span className={styles.streakBadge}>
        🔥 {streak > 0 ? `${streak}-day streak!` : "0-day streak — start today!"}
      </span>

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
        {saveError && <p className={styles.saveError}>{saveError}</p>}
      </div>

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
