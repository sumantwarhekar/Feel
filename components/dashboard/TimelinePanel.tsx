"use client";

import { motion } from "framer-motion";
import styles from "@/styles/dashboard.module.css";

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function TimelinePanel() {
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
