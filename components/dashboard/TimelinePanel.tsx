"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import { getAllEntries } from "@/lib/firebase/journal";
import type { JournalEntry } from "@/lib/firebase/journal";
import { exportAsPDF, exportAsTxt } from "@/lib/utils/export";
import styles from "@/styles/dashboard.module.css";

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good:  "🙂",
  meh:   "😐",
  bad:   "😔",
  awful: "😞",
};

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function TimelinePanel() {
  const { user } = useAuth();

  const [entries, setEntries]       = useState<JournalEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [exporting, setExporting]   = useState<"pdf" | "txt" | null>(null);

  useEffect(() => {
    if (!user) return;
    getAllEntries(user.uid)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [user]);

  const handleExportPDF = async () => {
    if (!user) return;
    setExporting("pdf");
    try {
      await exportAsPDF(entries, user.displayName ?? "My");
    } finally {
      setExporting(null);
    }
  };

  const handleExportTxt = () => {
    if (!user) return;
    exportAsTxt(entries, user.displayName ?? "My");
  };

  return (
    <motion.div key="timeline" {...panelVariants} transition={{ duration: 0.4 }}>
      <h1 className={styles.sectionHeading}>Timeline</h1>
      <p className={styles.sectionSubtext}>All your entries, most recent first.</p>

      {/* Export bar */}
      {!loading && entries.length > 0 && (
        <div className={styles.exportBar}>
          <button
            className={styles.exportBtn}
            onClick={handleExportPDF}
            disabled={exporting === "pdf"}
          >
            {exporting === "pdf" ? "Generating…" : "⬇ Export PDF"}
          </button>
          <button
            className={styles.exportBtn}
            onClick={handleExportTxt}
            disabled={exporting !== null}
          >
            ⬇ Export TXT
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>⏳</div>
          <h2 className={styles.emptyTitle}>Loading entries…</h2>
        </div>
      )}

      {/* Empty */}
      {!loading && entries.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>📋</div>
          <h2 className={styles.emptyTitle}>No entries yet</h2>
          <p className={styles.emptySubtext}>
            Write your first entry on the Today tab. Every line you write shows up here.
          </p>
        </div>
      )}

      {/* Entries list */}
      {!loading && entries.length > 0 && (
        <div className={styles.entriesList}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.timelineEntry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryDate}>
                  {entry.createdAt.toDate().toLocaleDateString("en-US", {
                    weekday: "short",
                    month:   "short",
                    day:     "numeric",
                    year:    "numeric",
                  })}
                </span>
                <span className={styles.entryMood}>
                  {MOOD_EMOJI[entry.mood] ?? ""} {entry.mood}
                </span>
              </div>
              <p className={styles.entryText}>{entry.text}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
