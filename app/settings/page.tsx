"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "@/styles/settings.module.css";
import navStyles from "@/styles/navbar.module.css";

const TABS = [
  { id: "account",     icon: "👤", label: "Account" },
  { id: "data",        icon: "💾", label: "Data & Privacy" },
  { id: "preferences", icon: "⚙️", label: "Preferences" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  /* ── Tab Content Renders ───────────────────────────────── */
  
  const renderAccountTab = () => (
    <motion.div
      key="account"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.settingsSection}>
        <h2 className={styles.settingsSectionTitle}>Profile Information</h2>
        <p className={styles.settingsSectionDesc}>Update your display name or email address.</p>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Display Name</h3>
            <p>{user?.displayName || "Not set"}</p>
          </div>
          <button className="btn-outline" style={{ padding: "6px 16px", fontSize: "0.875rem" }}>Edit</button>
        </div>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Email Address</h3>
            <p>{user?.email}</p>
          </div>
          <button className="btn-outline" style={{ padding: "6px 16px", fontSize: "0.875rem" }} disabled>Verified</button>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Delete Account</h3>
        <p>
          Permanently delete your account and all of your journal entries. 
          This action cannot be undone.
        </p>
        <button className={styles.btnDanger}>Delete Account</button>
      </div>
    </motion.div>
  );

  const renderDataTab = () => (
    <motion.div
      key="data"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.settingsSection}>
        <h2 className={styles.settingsSectionTitle}>Export Data</h2>
        <p className={styles.settingsSectionDesc}>Download a copy of all your journal entries.</p>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Download as JSON</h3>
            <p>Best for importing into other apps or programmatic use.</p>
          </div>
          <button className="btn-outline" style={{ padding: "6px 16px", fontSize: "0.875rem" }}>Export JSON</button>
        </div>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Download as TXT</h3>
            <p>A simple, human-readable text file of all your entries.</p>
          </div>
          <button className="btn-outline" style={{ padding: "6px 16px", fontSize: "0.875rem" }}>Export TXT</button>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Clear Journal</h3>
        <p>
          Delete all your past journal entries, but keep your account active.
          This will reset your streak to 0.
        </p>
        <button className={styles.btnDanger}>Clear All Entries</button>
      </div>
    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      key="preferences"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.settingsSection}>
        <h2 className={styles.settingsSectionTitle}>App Preferences</h2>
        <p className={styles.settingsSectionDesc}>Customize how Feel looks and behaves.</p>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Theme</h3>
            <p>Currently defaults to Light Mode.</p>
          </div>
          <button className="btn-outline" style={{ padding: "6px 16px", fontSize: "0.875rem" }}>Coming Soon</button>
        </div>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Daily Reminder</h3>
            <p>Get a notification to write your daily entry.</p>
          </div>
          <button className="btn-outline" style={{ padding: "6px 16px", fontSize: "0.875rem" }}>Coming Soon</button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={styles.pageShell}>
      {/* Simple Navbar for Settings */}
      <nav className={styles.settingsNav}>
        <div className="nav-inner">
          <Link href="/dashboard" className={navStyles.logoLink}>
            <div className={navStyles.logoCircle}>🌿</div>
            <span className={navStyles.logoWordmark}>Feel</span>
          </Link>
          <Link href="/dashboard" className="btn-outline" style={{ padding: "8px 16px", fontSize: "0.875rem" }}>
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className={styles.settingsContainer}>
        <h1 className={styles.pageTitle}>Settings</h1>
        
        <div className={styles.settingsLayout}>
          {/* Sidebar */}
          <div className={styles.settingsSidebar}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.settingsTab} ${activeTab === tab.id ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={styles.settingsContent}>
            <AnimatePresence mode="wait">
              {activeTab === "account" && renderAccountTab()}
              {activeTab === "data" && renderDataTab()}
              {activeTab === "preferences" && renderPreferencesTab()}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
