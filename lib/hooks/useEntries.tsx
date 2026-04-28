"use client";

import { useState, useEffect, useCallback } from "react";

export type MoodId = "great" | "good" | "meh" | "bad" | "awful";

export interface Entry {
  id: string;
  userId: string;
  text: string;
  mood: MoodId;
  /** Local date — YYYY-MM-DD */
  date: string;
  createdAt: string; // ISO string
}

interface UserMeta {
  streak: number;
  lastEntryDate: string | null; // YYYY-MM-DD
}

const ENTRIES_KEY = "feel_entries";
const META_KEY    = "feel_user_meta";

function localDateStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readEntries(): Entry[] {
  try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]"); }
  catch { return []; }
}

function writeEntries(entries: Entry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

function readMeta(): UserMeta {
  try { return JSON.parse(localStorage.getItem(META_KEY) ?? "null") ?? { streak: 0, lastEntryDate: null }; }
  catch { return { streak: 0, lastEntryDate: null }; }
}

function writeMeta(meta: UserMeta): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function useEntries() {
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [streak, setStreak]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    const today = localDateStr();
    const found = readEntries().find((e) => e.date === today) ?? null;
    setTodayEntry(found);
    setStreak(readMeta().streak);
    setLoading(false);
  }, []);

  const loadEntries = useCallback(() => {
    const sorted = readEntries().sort((a, b) => b.date.localeCompare(a.date));
    setEntries(sorted);
  }, []);

  const saveEntry = useCallback(async (text: string, mood: MoodId) => {
    setSaving(true);
    try {
      const today = localDateStr();
      const entry: Entry = {
        id:        crypto.randomUUID(),
        userId:    "local",
        text,
        mood,
        date:      today,
        createdAt: new Date().toISOString(),
      };

      writeEntries([...readEntries(), entry]);

      const meta      = readMeta();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = meta.lastEntryDate === localDateStr(yesterday)
        ? meta.streak + 1
        : 1;

      writeMeta({ streak: newStreak, lastEntryDate: today });
      setStreak(newStreak);
      setTodayEntry(entry);
    } finally {
      setSaving(false);
    }
  }, []);

  return { todayEntry, entries, streak, loading, saving, saveEntry, loadEntries };
}
