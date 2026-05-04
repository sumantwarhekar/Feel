"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEntries } from "@/lib/hooks/useEntries";
import styles from "@/styles/dashboard.module.css";
import { getMonthEntries, type Mood } from "@/lib/firebase/entries";

const MONTH_NAMES = [
  "January", "February", "March",     "April",   "May",      "June",
  "July",    "August",   "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOOD_EMOJI: Record<Mood, string> = {
  great: "😄",
  good:  "🙂",
  meh:   "😐",
  bad:   "😔",
  awful: "😞",
};

const MOOD_LABEL: Record<Mood, string> = {
  great: "Great",
  good:  "Good",
  meh:   "Meh",
  bad:   "Bad",
  awful: "Awful",
};

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function CalendarPanel() {
  const { user } = useAuth();
  const { streak } = useEntries();
  const today = new Date();

  const [year,       setYear]      = useState(today.getFullYear());
  const [month,      setMonth]     = useState(today.getMonth());
  const [filledDays, setFilledDays] = useState<Map<number, { mood: Mood; text: string }>>(new Map());
  const [loading,    setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getMonthEntries(user.uid, year, month)
      .then(setFilledDays)
      .catch(() => setFilledDays(new Map()))
      .finally(() => setLoading(false));
  }, [user, year, month]);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const goToPrev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const goToNext = () => {
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();

  return (
    <motion.div key="calendar" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Calendar</h1>
      <p className={styles.sectionSubtext}>Your journaling streak at a glance.</p>

      <div className={styles.streakBadge}>
        🔥 {streak} day{streak !== 1 ? "s" : ""} streak
      </div>

      <div className={`${styles.calendarCard} ${loading ? styles.calendarLoading : ""}`}>
        <div className={styles.calendarNav}>
          <motion.button
            className={styles.calendarNavBtn}
            onClick={goToPrev}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Previous month"
          >
            ‹
          </motion.button>
          <span className={styles.calendarMonthTitle}>
            {MONTH_NAMES[month]} {year}
          </span>
          <motion.button
            className={styles.calendarNavBtn}
            onClick={goToNext}
            disabled={isCurrentMonth}
            whileHover={isCurrentMonth ? undefined : { scale: 1.08 }}
            whileTap={isCurrentMonth ? undefined : { scale: 0.94 }}
            aria-label="Next month"
          >
            ›
          </motion.button>
        </div>

        <div className={styles.calendarGrid}>
          {DAY_NAMES.map((d) => (
            <div key={d} className={styles.calendarDayName}>{d[0]}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`sp-${i}`} className={styles.calendarCellSpacer} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day     = i + 1;
            const isToday  = isCurrentMonth && day === today.getDate();
            const isFuture = isCurrentMonth && day > today.getDate();
            const entry    = filledDays.get(day);
            const isFilled = !!entry;
            return (
              <div
                key={day}
                className={[
                  styles.calendarCell,
                  isFilled && styles.calendarCellFilled,
                  isToday  && styles.calendarCellToday,
                  isFuture && styles.calendarCellFuture,
                ].filter(Boolean).join(" ")}
              >
                {isFilled && entry ? (
                  <>
                    <span className={styles.calendarCellNum}>{day}</span>
                    <div className={styles.calendarCellContent}>
                      <span className={styles.calendarCellEmoji}>{MOOD_EMOJI[entry.mood]}</span>
                      <span className={styles.calendarCellMoodName}>{MOOD_LABEL[entry.mood]}</span>
                    </div>
                    {entry.text && (
                      <div className={styles.calendarTooltip}>
                        <span className={styles.calendarTooltipDate}>
                          {MONTH_NAMES[month]} {day}, {year}
                        </span>
                        <p className={styles.calendarTooltipText}>{entry.text}</p>
                      </div>
                    )}
                  </>
                ) : (
                  day
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
