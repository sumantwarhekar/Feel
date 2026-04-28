import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";

export interface JournalEntry {
  id: string;
  userId: string;
  text: string;
  mood: string;
  createdAt: Timestamp;
}

export async function saveEntry(
  userId: string,
  text: string,
  mood: string,
): Promise<void> {
  await addDoc(collection(db, "entries"), {
    userId,
    text,
    mood,
    createdAt: Timestamp.now(),
  });
  await updateStreak(userId);
}

export async function getTodayEntry(
  userId: string,
): Promise<JournalEntry | null> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "entries"),
    where("userId", "==", userId),
    where("createdAt", ">=", Timestamp.fromDate(todayStart)),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<JournalEntry, "id">) };
}

export async function getAllEntries(userId: string): Promise<JournalEntry[]> {
  const q = query(
    collection(db, "entries"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<JournalEntry, "id">),
  }));
}

async function updateStreak(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const lastEntryDate = data.lastEntryDate as Timestamp | null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = (data.streak as number) ?? 0;

  if (lastEntryDate) {
    const last = lastEntryDate.toDate();
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - last.getTime()) / 86_400_000,
    );
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
    // diffDays === 0: same day re-save, keep streak unchanged
  } else {
    streak = 1;
  }

  await updateDoc(userRef, { streak, lastEntryDate: Timestamp.now() });
}

export async function getUserStreak(userId: string): Promise<number> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  return (snap.data().streak as number) ?? 0;
}
