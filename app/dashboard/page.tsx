"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import TodayPanel from "@/components/dashboard/TodayPanel";
import styles from "@/styles/dashboard.module.css";

/* ── Timeline ── */
function TimelinePanel() {
  return (
    <motion.div
      key="timeline"
      {...panelVariants}
      transition={{ duration: 0.4 }}
    >
      <h1 className={styles.sectionHeading}>Timeline</h1>
      <p className={styles.sectionSubtext}>
        All your entries, most recent first.
      </p>
      <div className={styles.emptyState}>
        <div className={styles.emptyEmoji}>📋</div>
        <h2 className={styles.emptyTitle}>No entries yet</h2>
        <p className={styles.emptySubtext}>
          Write your first entry on the Today tab. Every line you write shows up
          here.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Calendar ── */
function CalendarPanel() {
  return (
    <motion.div
      key="calendar"
      {...panelVariants}
      transition={{ duration: 0.4 }}
    >
      <h1 className={styles.sectionHeading}>Calendar</h1>
      <p className={styles.sectionSubtext}>
        Your journaling streak at a glance.
      </p>
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
      <p className={styles.sectionSubtext}>
        Mood trends and journaling insights.
      </p>
      <div className={styles.emptyState}>
        <div className={styles.emptyEmoji}>📊</div>
        <h2 className={styles.emptyTitle}>No data yet</h2>
        <p className={styles.emptySubtext}>
          Stats and mood trends will appear here once you&apos;ve logged a few
          entries.
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
    </div>
  );
}
