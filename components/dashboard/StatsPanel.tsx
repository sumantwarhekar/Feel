"use client";

import { motion } from "framer-motion";
import styles from "@/styles/dashboard.module.css";

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function StatsPanel() {
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
