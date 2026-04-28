import type { Entry, MoodId } from "@/lib/hooks/useEntries";

const ENTRIES_KEY = "feel_entries";
const META_KEY    = "feel_user_meta";

const SEED_TEXTS: { text: string; mood: MoodId }[] = [
  { mood: "great",  text: "Crushed the presentation at work — team was genuinely impressed." },
  { mood: "good",   text: "Nice long walk after dinner, reminded me how much I need that." },
  { mood: "meh",    text: "Mostly emails and meetings, nothing bad, nothing remarkable." },
  { mood: "good",   text: "Cooked a proper meal for once instead of ordering in." },
  { mood: "bad",    text: "Missed my morning run and felt off-rhythm the entire day." },
  { mood: "great",  text: "Old friend called out of nowhere — talked for two hours straight." },
  { mood: "good",   text: "Finished the book I've been dragging through for three weeks." },
  { mood: "meh",    text: "Couldn't shake a low-grade headache, just wanted the day to end." },
  { mood: "awful",  text: "Everything felt like wading through fog — no energy, no focus." },
  { mood: "good",   text: "Productive morning, inbox at zero by noon." },
  { mood: "great",  text: "Spontaneous road trip with no plan — exactly what I needed." },
  { mood: "meh",    text: "Watched two episodes of something forgettable, called it a night." },
  { mood: "good",   text: "Gym session felt strong for the first time in weeks." },
  { mood: "bad",    text: "Argument with a close friend — still sitting with that." },
  { mood: "great",  text: "Got some genuinely kind feedback on something I almost didn't share." },
];

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function seedEntries(): number {
  const existing: Entry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");
  const usedDates = new Set(existing.map((e) => e.date));

  const fresh: Entry[] = [];
  for (let i = SEED_TEXTS.length; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    if (usedDates.has(dateStr)) continue;

    const { text, mood } = SEED_TEXTS[SEED_TEXTS.length - i];
    fresh.push({
      id:        crypto.randomUUID(),
      userId:    "local",
      text,
      mood,
      date:      dateStr,
      createdAt: d.toISOString(),
    });
  }

  if (fresh.length === 0) return 0;

  localStorage.setItem(ENTRIES_KEY, JSON.stringify([...existing, ...fresh]));
  localStorage.setItem(META_KEY, JSON.stringify({
    streak:        fresh.length,
    lastEntryDate: fresh[fresh.length - 1].date,
  }));

  return fresh.length;
}
