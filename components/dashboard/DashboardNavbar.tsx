"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/hooks/useAuth";
import navStyles from "@/styles/navbar.module.css";
import styles from "@/styles/dashboard.module.css";

/* ── Helper: user initials ──────────────────────────────── */
function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
}

/* ── Profile dropdown ───────────────────────────────────── */
function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();

  return (
    <motion.div
      className={styles.dropdown}
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.dropdownHeader}>
        <p className={styles.dropdownName}>{user?.displayName ?? "User"}</p>
        <p className={styles.dropdownEmail}>{user?.email}</p>
      </div>
      <div className={styles.dropdownBody}>
        <button className={styles.dropdownItem} onClick={onClose}>
          ⚙️ &nbsp;Settings
        </button>
        <button
          className={`${styles.dropdownItem} ${styles.danger}`}
          onClick={() => { logout(); onClose(); }}
        >
          🚪 &nbsp;Sign out
        </button>
      </div>
    </motion.div>
  );
}

/* ── Dashboard Navbar ───────────────────────────────────── */
interface Tab {
  id: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "today",    label: "Today",    icon: "✏️" },
  { id: "timeline", label: "Timeline", icon: "📋" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "stats",    label: "Stats",    icon: "📊" },
];

interface DashboardNavbarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function DashboardNavbar({ activeTab, onTabChange }: DashboardNavbarProps) {
  const { user } = useAuth();
  const [hidden, setHidden]           = useState(false);
  const [elevated, setElevated]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const lastScrollY   = useRef(0);
  const tabRefs       = useRef<Map<string, HTMLButtonElement>>(new Map());
  const listRef       = useRef<HTMLDivElement>(null);
  const dropdownRef   = useRef<HTMLDivElement>(null);

  /* ── Hide on scroll down, show on scroll up ── */
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastScrollY.current && currentY > 80);
      setElevated(currentY > 10);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Tab indicator position ── */
  const updateIndicator = (id: string) => {
    const btn  = tabRefs.current.get(id);
    const list = listRef.current;
    if (!btn || !list) return;
    const bR = btn.getBoundingClientRect();
    const lR = list.getBoundingClientRect();
    setIndicatorStyle({ left: bR.left - lR.left, width: bR.width });
  };

  useEffect(() => { updateIndicator(activeTab); }, [activeTab]);

  useEffect(() => {
    const onResize = () => updateIndicator(activeTab);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeTab]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  return (
    <nav className={`${styles.dashNav} ${hidden ? styles.hidden : ""} ${elevated ? styles.elevated : ""}`}>
      <div className="nav-inner">
        {/* Left: Logo */}
        <Link href="/dashboard" className={navStyles.logoLink}>
          <div className={navStyles.logoCircle}>🌿</div>
          <span className={navStyles.logoWordmark}>Feel</span>
        </Link>

        {/* Centre: Tabs */}
        <div ref={listRef} className="tab-list">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
              className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}

          {/* Sliding indicator */}
          <motion.div
            className={navStyles.indicator}
            animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        </div>

        {/* Right: Profile */}
        <div ref={dropdownRef} className={styles.profileWrap}>
          <motion.button
            className={styles.avatarBtn}
            onClick={() => setDropdownOpen((o) => !o)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            title="Profile"
          >
            {getInitials(user?.displayName, user?.email)}
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <ProfileDropdown onClose={() => setDropdownOpen(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
