import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

export const metadata: Metadata = {
  title: "Feel — One Line a Day",
  description:
    "Feel is a mindful micro-journaling app. Capture your day in one line, track your mood, and build a journaling habit that actually sticks.",
  keywords: ["journaling", "mood tracking", "mindfulness", "daily journal", "habit tracker"],
  authors: [{ name: "Feel Team" }],
  openGraph: {
    title: "Feel — One Line a Day",
    description: "Capture your day in one line. Track your mood. Build the habit.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
