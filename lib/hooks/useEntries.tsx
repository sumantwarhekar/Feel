"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";

export type MoodId = "great" | "good" | "meh" | "bad" | "awful";

export interface Entry {
  id: string;
  userId: string;
  text: string;
  mood: MoodId;
  /** Local date string — YYYY-MM-DD */
  date: string;
  createdAt: Timestamp;
}

/** Returns YYYY-MM-DD in the user's local timezone for the given Date (default: now). */
function localDateStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Requires two composite Firestore indexes:
 *  1. entries: userId ASC, date ASC      (for today query)
 *  2. entries: userId ASC, date DESC     (for timeline query)
 * Firebase will log a console link to create them on first use if they're missing.
 */
export function useEntries() {
  const { user } = useAuth();
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  /* On mount: load today's entry + streak */
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    (async () => {
      try {
        const today = localDateStr();

        const todayQ = query(
          collection(db, "entries"),
          where("userId", "==", user.uid),
          where("date",   "==", today),
        );
        const snap = await getDocs(todayQ);
        if (!snap.empty) {
          const d = snap.docs[0];
          setTodayEntry({ id: d.id, ...(d.data() as Omit<Entry, "id">) });
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setStreak(userSnap.data().streak ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /** Fetch all entries ordered by date desc — call this when the Timeline mounts. */
  const loadEntries = useCallback(async () => {
    if (!user) return;
    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
    );
    const snap = await getDocs(q);
    setEntries(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Entry, "id">) })));
  }, [user]);

  /** Persist a new entry and update the user's streak. */
  const saveEntry = useCallback(async (text: string, mood: MoodId) => {
    if (!user) return;
    setSaving(true);
    try {
      const today = localDateStr();

      const ref = await addDoc(collection(db, "entries"), {
        userId:    user.uid,
        text,
        mood,
        date:      today,
        createdAt: serverTimestamp(),
      });

      /* Streak: +1 if last entry was yesterday, else reset to 1 */
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let newStreak  = 1;
      if (userSnap.exists()) {
        const data   = userSnap.data();
        const lastTs = data.lastEntryDate as Timestamp | null;
        if (lastTs) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (localDateStr(lastTs.toDate()) === localDateStr(yesterday)) {
            newStreak = (data.streak ?? 0) + 1;
          }
        }
      }

      await updateDoc(userRef, { streak: newStreak, lastEntryDate: serverTimestamp() });

      setStreak(newStreak);
      setTodayEntry({
        id: ref.id, userId: user.uid, text, mood, date: today, createdAt: Timestamp.now(),
      });
    } finally {
      setSaving(false);
    }
  }, [user]);

  return { todayEntry, entries, streak, loading, saving, saveEntry, loadEntries };
}
