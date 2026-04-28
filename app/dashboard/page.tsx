"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEntries, type MoodId, type Entry } from "@/lib/hooks/useEntries";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import TodayPanel     from "@/components/dashboard/TodayPanel";
import CalendarPanel  from "@/components/dashboard/CalendarPanel";
import TimelinePanel  from "@/components/dashboard/TimelinePanel";
import StatsPanel     from "@/components/dashboard/StatsPanel";
import styles from "@/styles/dashboard.module.css";

const isDev = process.env.NODE_ENV === "development";

/* ── Mood options ───────────────────────────────────────── */
const MOODS = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good",  emoji: "🙂", label: "Good"  },
  { id: "meh",   emoji: "😐", label: "Meh"   },
  { id: "bad",   emoji: "😔", label: "Bad"   },
  { id: "awful", emoji: "😞", label: "Awful" },
];

const MAX_CHARS = 280;

/* ── Mood CSS class maps ────────────────────────────────── */
const MOOD_PILL: Record<string, string> = {
  great: styles.pillGreat,
  good:  styles.pillGood,
  meh:   styles.pillMeh,
  bad:   styles.pillBad,
  awful: styles.pillAwful,
};

const MOOD_ACCENT: Record<string, string> = {
  great: styles.accentGreat,
  good:  styles.accentGood,
  meh:   styles.accentMeh,
  bad:   styles.accentBad,
  awful: styles.accentAwful,
};

const MOOD_BAR: Record<string, string> = {
  great: styles.barGreat,
  good:  styles.barGood,
  meh:   styles.barMeh,
  bad:   styles.barBad,
  awful: styles.barAwful,
};

/* ── Panel transition ───────────────────────────────────── */
const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

/* ── List stagger ───────────────────────────────────────── */
const listVariants: Variants = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/* ── Helpers ────────────────────────────────────────────── */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function relativeDate(dateStr: string): string {
  const today     = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 864e5));
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dateToDay(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.floor(new Date(y, m - 1, d).getTime() / 864e5);
}

function calcBestStreak(entries: Entry[]): number {
  if (!entries.length) return 0;
  const days = [...new Set(entries.map((e) => dateToDay(e.date)))].sort((a, b) => a - b);
  let best = 1, curr = 1;
  for (let i = 1; i < days.length; i++) {
    curr = days[i] - days[i - 1] === 1 ? curr + 1 : 1;
    best = Math.max(best, curr);
  }
  return best;
}

/* ════════════════════════════════════════════════════════════
   Tab Panels
   ════════════════════════════════════════════════════════════ */

/* ── Today ── */
function TodayPanel() {
  const { user } = useAuth();
  const { todayEntry, streak, loading, saving, saveEntry } = useEntries();
  const [text, setText] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      await saveEntry(text, mood as MoodId);
      setSaved(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
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

  if (saved || todayEntry) {
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
        {error && <p className={styles.saveError}>{error}</p>}
        {text.trim() && !mood && (
          <p className={styles.saveHint}>Pick a mood below to save your entry.</p>
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

/* ── Timeline ── */
function TimelinePanel() {
  const { entries, loading, loadEntries } = useEntries();

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
      const key = entry.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  }, [entries]);

  if (loading) {
    return (
      <motion.div key="tl-loading" {...panelVariants} transition={{ duration: 0.4 }}>
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>⏳</div>
          <p className={styles.emptySubtext}>Loading…</p>
        </div>
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div key="timeline-empty" {...panelVariants} transition={{ duration: 0.4 }}>
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

  return (
    <motion.div key="timeline" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Timeline</h1>
      <p className={styles.sectionSubtext}>{entries.length} {entries.length === 1 ? "entry" : "entries"} total.</p>

      <motion.div className={styles.timelineList} variants={listVariants} initial="initial" animate="animate">
        {Array.from(grouped.entries()).map(([key, monthEntries]) => (
          <div key={key} className={styles.monthGroup}>
            <div className={styles.monthHeader}>
              <span className={styles.monthLabel}>{formatMonth(key)}</span>
              <span className={styles.monthCount}>{monthEntries.length}</span>
            </div>
            {monthEntries.map((entry) => {
              const mood = MOODS.find((m) => m.id === entry.mood);
              return (
                <motion.div
                  key={entry.id}
                  variants={itemVariants}
                  className={`${styles.timelineEntry} ${MOOD_ACCENT[entry.mood] ?? ""}`}
                >
                  <div className={styles.entryMeta}>
                    <span className={styles.entryDate}>{relativeDate(entry.date)}</span>
                    {mood && (
                      <span className={`${styles.entryMoodPill} ${MOOD_PILL[entry.mood] ?? ""}`}>
                        {mood.emoji} {mood.label}
                      </span>
                    )}
                  </div>
                  <p className={styles.entryBody}>{entry.text}</p>
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>

      <div className={styles.timelineFooter}>
        <DeleteDataButton />
      </div>
    </motion.div>
  );
}

function DeleteDataButton() {
  const [confirm, setConfirm] = useState(false);

  const handleDelete = () => {
    localStorage.removeItem("feel_entries");
    localStorage.removeItem("feel_user_meta");
    window.location.reload();
  };

  if (confirm) {
    return (
      <div className={styles.deleteConfirm}>
        <span className={styles.deleteConfirmText}>Delete all entries?</span>
        <button className={styles.deleteConfirmYes} onClick={handleDelete}>Yes, delete</button>
        <button className={styles.deleteConfirmNo} onClick={() => setConfirm(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <button className={styles.deleteDataBtn} onClick={() => setConfirm(true)}>
      🗑 Delete all data
    </button>
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
  const { entries, loading, loadEntries } = useEntries();
  const { streak } = useEntries();

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const stats = useMemo(() => {
    const total      = entries.length;
    const best       = calcBestStreak(entries);
    const moodCounts = Object.fromEntries(MOODS.map((m) => [m.id, 0])) as Record<string, number>;
    entries.forEach((e) => { moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1; });
    const maxCount   = Math.max(...Object.values(moodCounts), 1);
    const topMood    = MOODS.reduce((a, b) => moodCounts[a.id] >= moodCounts[b.id] ? a : b);

    const monthly: { label: string; key: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key   = toDateStr(d).slice(0, 7);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      monthly.push({ key, label, count: entries.filter((e) => e.date.startsWith(key)).length });
    }
    const maxMonthly = Math.max(...monthly.map((m) => m.count), 1);

    return { total, best, moodCounts, maxCount, topMood, monthly, maxMonthly };
  }, [entries]);

  if (loading) {
    return (
      <motion.div key="stats-loading" {...panelVariants} transition={{ duration: 0.4 }}>
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>⏳</div>
          <p className={styles.emptySubtext}>Loading…</p>
        </div>
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div key="stats-empty" {...panelVariants} transition={{ duration: 0.4 }}>
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

  return (
    <motion.div key="stats" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Stats</h1>
      <p className={styles.sectionSubtext}>Mood trends and journaling insights.</p>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total entries</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statValue}>{streak}</div>
          <div className={styles.statLabel}>Current streak</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div className={styles.statValue}>{stats.best}</div>
          <div className={styles.statLabel}>Best streak</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>{stats.topMood.emoji}</div>
          <div className={styles.statValue}>{stats.topMood.label}</div>
          <div className={styles.statLabel}>Top mood</div>
        </div>
      </div>

      {/* Mood distribution */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>How you&apos;ve been feeling</p>
        {MOODS.map((m) => {
          const count = stats.moodCounts[m.id] ?? 0;
          const pct   = Math.round((count / stats.total) * 100);
          return (
            <div key={m.id} className={styles.moodBarRow}>
              <span className={styles.moodBarLabel}>{m.emoji} {m.label}</span>
              <div className={styles.moodBarTrack}>
                <motion.div
                  className={`${styles.moodBarFill} ${MOOD_BAR[m.id] ?? ""}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / stats.maxCount) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <span className={styles.moodBarCount}>{count} <span className={styles.moodBarPct}>{pct}%</span></span>
            </div>
          );
        })}
      </div>

      {/* Monthly activity */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>Activity — last 6 months</p>
        <div className={styles.activityChart}>
          {stats.monthly.map((m) => (
            <div key={m.key} className={styles.activityCol}>
              <span className={styles.activityCount}>{m.count > 0 ? m.count : ""}</span>
              <div className={styles.activityBarWrap}>
                <motion.div
                  className={styles.activityBarFill}
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.count / stats.maxMonthly) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <span className={styles.activityLabel}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Dev seed button ── */
function SeedButton() {
  const [status, setStatus] = useState<"idle" | "seeding" | "done">("idle");

  const handleSeed = async () => {
    setStatus("seeding");
    const { seedEntries } = await import("@/lib/utils/seedEntries");
    seedEntries();
    setStatus("done");
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <button onClick={handleSeed} disabled={status !== "idle"} style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      padding: "8px 16px", borderRadius: 999, border: "1px dashed #aaa",
      background: "white", fontSize: "0.75rem", color: "#666", cursor: "pointer",
      opacity: status !== "idle" ? 0.6 : 1,
    }}>
      {status === "seeding" ? "Seeding…" : status === "done" ? "Done!" : "🌱 Seed data"}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   Dashboard Page
   ════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("today");

  const renderPanel = () => {
    switch (activeTab) {
      case "today":
        return <TodayPanel />;
      case "timeline":
        return <TimelinePanel />;
      case "calendar":
        return <CalendarPanel />;
      case "stats":
        return <StatsPanel />;
      default:
        return <TodayPanel />;
    }
  };

  return (
    <div className={styles.shell}>
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={styles.tabContent}>
        <AnimatePresence mode="wait">{renderPanel()}</AnimatePresence>
      </main>

      {isDev && <SeedButton />}
    </div>
  );
}
