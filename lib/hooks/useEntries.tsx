"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  saveEntry as firestoreSaveEntry,
  getTodayEntry,
  getUserStreak,
  getAllEntries,
  type Mood,
} from "@/lib/firebase/entries";

export type MoodId = Mood;

export interface Entry {
  id: string;
  userId: string;
  text: string;
  mood: MoodId;
  /** Local date — YYYY-MM-DD */
  date: string;
  createdAt: string; // ISO string
}

export function useEntries() {
  const { user } = useAuth();
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.allSettled([
      getTodayEntry(user.uid),
      getUserStreak(user.uid),
    ]).then(([entryResult, streakResult]) => {
      if (cancelled) return;
      if (entryResult.status === "fulfilled" && entryResult.value) {
        const e = entryResult.value;
        setTodayEntry({
          id:        e.id,
          userId:    user.uid,
          text:      e.text,
          mood:      e.mood as MoodId,
          date:      e.id.slice(user.uid.length + 1),
          createdAt: new Date().toISOString(),
        });
      }
      if (streakResult.status === "fulfilled") {
        setStreak(streakResult.value);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [user]);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    const all = await getAllEntries(user.uid);
    setEntries(all.map((e) => ({
      id:        e.id,
      userId:    user.uid,
      text:      e.text,
      mood:      e.mood as MoodId,
      date:      e.date,
      createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
    })));
  }, [user]);

  const saveEntry = useCallback(async (text: string, mood: MoodId) => {
    if (!user) return;
    setSaving(true);
    try {
      const newStreak = await firestoreSaveEntry(user.uid, text, mood);
      setStreak(newStreak);
      const today   = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      setTodayEntry({
        id:        `${user.uid}_${dateStr}`,
        userId:    user.uid,
        text,
        mood,
        date:      dateStr,
        createdAt: today.toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }, [user]);

  return { todayEntry, entries, streak, loading, saving, saveEntry, loadEntries };
}
