import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export type Mood = "great" | "good" | "meh" | "bad" | "awful";

export interface JournalEntry {
  id: string;
  text: string;
  mood: Mood;
}

function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function saveEntry(
  userId: string,
  text: string,
  mood: Mood
): Promise<number> {
  await setDoc(doc(db, "entries", `${userId}_${localDateKey()}`), {
    userId,
    text,
    mood,
    createdAt: serverTimestamp(),
  });

  let newStreak = 1;
  try {
    const userRef  = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const data     = userSnap.data();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data?.lastEntryDate) {
      const last: Date = (data.lastEntryDate as Timestamp).toDate();
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round(
        (today.getTime() - last.getTime()) / 86_400_000
      );
      if (diffDays === 0) {
        newStreak = data.streak || 1;        // || catches 0, null, undefined
      } else if (diffDays === 1) {
        newStreak = (data.streak ?? 0) + 1;
      }
    }

    await setDoc(
      userRef,
      { streak: newStreak, lastEntryDate: serverTimestamp() },
      { merge: true }
    );
  } catch {
    // Entry is already saved — streak update failing should not block submission
  }

  return newStreak;
}

export async function getTodayEntry(userId: string): Promise<JournalEntry | null> {
  const snap = await getDoc(doc(db, "entries", `${userId}_${localDateKey()}`));
  if (!snap.exists()) return null;
  return {
    id:   snap.id,
    text: snap.data().text as string,
    mood: snap.data().mood as Mood,
  };
}

export async function getUserStreak(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, "users", userId));
  return (snap.data()?.streak as number | undefined) ?? 0;
}

export async function getMonthEntries(
  userId: string,
  year: number,
  month: number  // 0-indexed
): Promise<Set<number>> {
  const snap = await getDocs(
    query(collection(db, "entries"), where("userId", "==", userId))
  );

  const days = new Set<number>();
  snap.forEach((d) => {
    const ts = d.data().createdAt as Timestamp | undefined;
    if (ts) {
      const date = ts.toDate();
      if (date.getFullYear() === year && date.getMonth() === month) {
        days.add(date.getDate());
      }
    }
  });
  return days;
}
