import type { JournalEntry } from "@/lib/firebase/journal";
import { Timestamp } from "firebase/firestore";

const MOOD_LABELS: Record<string, string> = {
  great: "😄 Great",
  good: "🙂 Good",
  meh: "😐 Meh",
  bad: "😔 Bad",
  awful: "😞 Awful",
};

function formatDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── Text export ─────────────────────────────────────────── */
export function exportAsTxt(
  entries: JournalEntry[],
  displayName: string,
): void {
  const header = [
    "Feel — Journal Export",
    `${displayName}'s journal`,
    `Exported on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`,
    "═".repeat(50),
    "",
  ].join("\n");

  const body = entries
    .map((e) =>
      [
        formatDate(e.createdAt),
        `Mood: ${MOOD_LABELS[e.mood] ?? e.mood}`,
        "",
        e.text,
        "─".repeat(50),
      ].join("\n"),
    )
    .join("\n\n");

  const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
  triggerDownload(blob, `feel-journal-${todaySlug()}.txt`);
}

/* ── PDF export ──────────────────────────────────────────── */
export async function exportAsPDF(
  entries: JournalEntry[],
  displayName: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkY = (needed: number) => {
    if (y + needed > pageH - margin) addPage();
  };

  /* Cover block */
  doc.setFillColor(34, 197, 94);
  doc.rect(0, 0, pageW, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 30, 30);
  doc.text("Feel", margin, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`${displayName}'s journal`, margin, y + 32);
  doc.text(
    `Exported ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · ${entries.length} entr${entries.length === 1 ? "y" : "ies"}`,
    margin,
    y + 48,
  );

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y + 62, pageW - margin, y + 62);
  y += 80;

  /* Entries */
  for (const entry of entries) {
    checkY(80);

    /* Date pill */
    const dateStr = formatDate(entry.createdAt);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text(dateStr.toUpperCase(), margin, y);
    y += 6;

    /* Mood */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Mood: ${MOOD_LABELS[entry.mood] ?? entry.mood}`, margin, y + 10);
    y += 20;

    /* Entry text — wrapped */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(entry.text, contentW) as string[];
    const textH = lines.length * 16;
    checkY(textH + 20);
    doc.text(lines, margin, y);
    y += textH + 8;

    /* Divider */
    doc.setDrawColor(235, 235, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 20;
  }

  /* Page numbers */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`${i} / ${pageCount}`, pageW - margin, pageH - 28, {
      align: "right",
    });
  }

  doc.save(`feel-journal-${todaySlug()}.pdf`);
}

/* ── Helpers ─────────────────────────────────────────────── */
function todaySlug(): string {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
