"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import navStyles from "@/styles/navbar.module.css";

/* ── Types ──────────────────────────────────────────────── */
interface Tab {
  id: string;
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { id: "today",    label: "Today",    href: "#today"    },
  { id: "timeline", label: "Timeline", href: "#timeline" },
  { id: "calendar", label: "Calendar", href: "#calendar" },
  { id: "stats",    label: "Stats",    href: "#stats"    },
];

/* ── Logo ───────────────────────────────────────────────── */
function Logo() {
  return (
    <Link href="/" className={navStyles.logoLink}>
      <div className={navStyles.logoCircle}>🌿</div>
      <span className={navStyles.logoWordmark}>Feel</span>
    </Link>
  );
}

/* ── Auth buttons ───────────────────────────────────────── */
function AuthButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <motion.button
        className={navStyles.avatarBtn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        title="Profile"
      >
        JS
      </motion.button>
    );
  }

  return (
    <div className={navStyles.authButtons}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href="/login" className={`btn-outline ${navStyles.signInBtn}`}>
          Sign in
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href="/register" className={`btn-primary ${navStyles.getStartedBtn}`}>
          Get started
        </Link>
      </motion.div>
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────── */
export default function Navbar() {
  const [activeTab, setActiveTab]             = useState("today");
  const [scrolled, setScrolled]               = useState(false);
  const [indicatorStyle, setIndicatorStyle]   = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* position the sliding indicator */
  const updateIndicator = (id: string) => {
    const btn  = tabRefs.current.get(id);
    const list = listRef.current;
    if (!btn || !list) return;
    const btnRect  = btn.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    setIndicatorStyle({ left: btnRect.left - listRect.left, width: btnRect.width });
  };

  useEffect(() => { updateIndicator(activeTab); }, [activeTab]);

  useEffect(() => {
    const onResize = () => updateIndicator(activeTab);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeTab]);

  return (
    <nav className={`nav-root${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        {/* Left: Logo */}
        <Logo />

        {/* Centre: Tab list */}
        <div ref={listRef} className="tab-list">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => { if (el) tabRefs.current.set(tab.id, el); }}
              className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                document.querySelector(tab.href)?.scrollIntoView({ behavior: "smooth" });
              }}
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

        {/* Right: Auth */}
        <AuthButton isLoggedIn={false} />
      </div>
    </nav>
  );
}
