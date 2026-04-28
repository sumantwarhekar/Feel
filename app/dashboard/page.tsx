"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import TodayPanel     from "@/components/dashboard/TodayPanel";
import CalendarPanel  from "@/components/dashboard/CalendarPanel";
import TimelinePanel  from "@/components/dashboard/TimelinePanel";
import StatsPanel     from "@/components/dashboard/StatsPanel";
import styles from "@/styles/dashboard.module.css";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("today");

  const renderPanel = () => {
    switch (activeTab) {
      case "today":
        return <TodayPanel />;
      case "timeline":
        return <TimelinePanel />;
      case "calendar":
        return <CalendarPanel />;
      case "stats":
        return <StatsPanel />;
      default:
        return <TodayPanel />;
    }
  };

  return (
    <div className={styles.shell}>
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={styles.tabContent}>
        <AnimatePresence mode="wait">{renderPanel()}</AnimatePresence>
      </main>
    </div>
  );
}
