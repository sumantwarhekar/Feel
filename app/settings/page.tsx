"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { deleteAllEntries } from "@/lib/firebase/entries";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "@/styles/settings.module.css";
import navStyles from "@/styles/navbar.module.css";

const TABS = [
  { id: "account",     icon: "👤", label: "Account" },
  { id: "data",        icon: "💾", label: "Data & Privacy" },
  { id: "preferences", icon: "⚙️", label: "Preferences" },
];

export default function SettingsPage() {
  const { user, deleteAccount, reauthenticateUser, updateUserDisplayName, updateUserPreferences } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [passwordInput, setPasswordInput] = useState("");

  // Preferences State
  const [preferences, setPreferences] = useState({ reminderEnabled: false, reminderTime: "20:00" });
  const [prefsLoading, setPrefsLoading] = useState(true);

  // Fetch Preferences on mount
  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists() && snap.data().preferences) {
          setPreferences({ ...preferences, ...snap.data().preferences });
        }
        setPrefsLoading(false);
      });
    }
  }, [user?.uid]);

  const handleUpdatePreference = async (key: string, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs); // Optimistic UI update
    await updateUserPreferences(newPrefs);
  };

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "clear" | "delete" | null;
    loading: boolean;
    error: string | null;
    needsReauth: boolean;
  }>({ isOpen: false, type: null, loading: false, error: null, needsReauth: false });

  const handleConfirmAction = async () => {
    if (!confirmModal.type || !user) return;
    setConfirmModal((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      if (confirmModal.type === "clear") {
        await deleteAllEntries(user.uid);
        setConfirmModal({ isOpen: false, type: null, loading: false, error: null, needsReauth: false });
        window.location.reload(); 
      } else if (confirmModal.type === "delete") {
        if (confirmModal.needsReauth) {
          await reauthenticateUser(passwordInput);
          // If successful, proceed to delete again
          await deleteAccount();
        } else {
          await deleteAccount();
        }
      }
    } catch (err: any) {
      if (err?.message === "requires-recent-login") {
        setConfirmModal((prev) => ({ 
          ...prev, 
          loading: false, 
          needsReauth: true, 
          error: "Verification required to continue." 
        }));
      } else {
        setConfirmModal((prev) => ({ 
          ...prev, 
          loading: false, 
          error: err?.toString() || "Something went wrong." 
        }));
      }
    }
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput === user?.displayName) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await updateUserDisplayName(nameInput.trim());
      setIsEditingName(false);
    } catch (err) {
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

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
          <div className={`${styles.settingsRowLeft} ${styles.w100}`}>
            <h3>Display Name</h3>
            {isEditingName ? (
              <div className={styles.editNameRow}>
                <input 
                  type="text" 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)} 
                  className={`${styles.authInput} ${styles.mt0}`}
                  autoFocus
                  disabled={isSavingName}
                />
              </div>
            ) : (
              <p>{user?.displayName || "Not set"}</p>
            )}
          </div>
          {isEditingName ? (
            <div className={styles.flexRow}>
              <button 
                className={`btn-outline ${styles.btnSmallNoBorder}`}
                onClick={() => setIsEditingName(false)}
                disabled={isSavingName}
              >
                Cancel
              </button>
              <button 
                className={`btn-primary ${styles.btnSmall}`}
                onClick={handleSaveName}
                disabled={isSavingName}
              >
                {isSavingName ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button 
              className={`btn-outline ${styles.btnSmall}`}
              onClick={() => {
                setNameInput(user?.displayName || "");
                setIsEditingName(true);
              }}
            >
              Edit
            </button>
          )}
        </div>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Email Address</h3>
            <p>{user?.email}</p>
          </div>
          <button className={`btn-outline ${styles.btnSmall}`} disabled>Verified</button>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Delete Account</h3>
        <p>
          Permanently delete your account and all of your journal entries. 
          This action cannot be undone.
        </p>
        <button 
          className={styles.btnDanger}
          onClick={() => {
            setPasswordInput("");
            setConfirmModal({ isOpen: true, type: "delete", loading: false, error: null, needsReauth: false });
          }}
        >
          Delete Account
        </button>
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
          <button className={`btn-outline ${styles.btnSmall}`}>Export JSON</button>
        </div>
        
        <div className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <h3>Download as TXT</h3>
            <p>A simple, human-readable text file of all your entries.</p>
          </div>
          <button className={`btn-outline ${styles.btnSmall}`}>Export TXT</button>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Clear Journal</h3>
        <p>
          Delete all your past journal entries, but keep your account active.
          This will reset your streak to 0.
        </p>
        <button 
          className={styles.btnDanger}
          onClick={() => setConfirmModal({ isOpen: true, type: "clear", loading: false, error: null, needsReauth: false })}
        >
          Clear All Entries
        </button>
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
            <h3>Daily Reminder</h3>
            <p>Get a daily email reminder to write your journal entry.</p>
          </div>
          {prefsLoading ? (
            <span className={styles.loadingText}>Loading...</span>
          ) : (
            <div className={styles.flexRowCenter}>
              {preferences.reminderEnabled && (
                <input
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => handleUpdatePreference("reminderTime", e.target.value)}
                  className={`${styles.authInput} ${styles.reminderInput}`}
                />
              )}
              <label className={styles.toggleLabel}>
                <div 
                  className={styles.toggleTrack}
                  style={{
                    background: preferences.reminderEnabled ? "var(--green-500)" : "var(--gray-300)"
                  }}
                  onClick={() => handleUpdatePreference("reminderEnabled", !preferences.reminderEnabled)}
                >
                  <div 
                    className={styles.toggleThumb}
                    style={{
                      left: preferences.reminderEnabled ? "22px" : "2px"
                    }} 
                  />
                </div>
              </label>
            </div>
          )}
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
          <Link href="/dashboard" className={`btn-outline ${styles.btnSmall}`}>
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className={styles.modalOverlay} onClick={() => !confirmModal.loading && setConfirmModal({ isOpen: false, type: null, loading: false, error: null, needsReauth: false })}>
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalIcon}>
                {confirmModal.needsReauth ? "🔐" : (confirmModal.type === "delete" ? "⚠️" : "🗑️")}
              </div>
              <h2 className={styles.modalTitle}>
                {confirmModal.needsReauth ? "Verify Identity" : (confirmModal.type === "delete" ? "Delete Account?" : "Clear Journal?")}
              </h2>
              <p className={styles.modalDesc}>
                {confirmModal.needsReauth
                  ? "For security, please verify your identity to proceed with account deletion."
                  : (confirmModal.type === "delete" 
                      ? "This will permanently delete your account, settings, and all journal entries. This action cannot be undone."
                      : "This will delete all your past journal entries and reset your consistency streak to 0. This cannot be undone.")
                }
              </p>

              {confirmModal.needsReauth && user?.providerData[0]?.providerId === "password" && (
                <input 
                  type="password" 
                  placeholder="Enter your password" 
                  className={styles.authInput}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={confirmModal.loading}
                  autoFocus
                />
              )}
              
              {confirmModal.error && (
                <div className={styles.modalError}>
                  {confirmModal.error}
                </div>
              )}

              <div className={styles.modalActions}>
                <button 
                  className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                  onClick={() => setConfirmModal({ isOpen: false, type: null, loading: false, error: null, needsReauth: false })}
                  disabled={confirmModal.loading}
                >
                  Cancel
                </button>
                <button 
                  className={`${styles.modalBtn} ${confirmModal.needsReauth && user?.providerData[0]?.providerId === "google.com" ? "btn-outline" : styles.modalBtnDanger}`}
                  onClick={handleConfirmAction}
                  disabled={confirmModal.loading}
                  style={confirmModal.needsReauth && user?.providerData[0]?.providerId === "google.com" ? { background: "white", color: "#3b82f6", border: "1px solid #3b82f6" } : {}}
                >
                  {confirmModal.loading 
                    ? "Processing..." 
                    : (confirmModal.needsReauth 
                        ? (user?.providerData[0]?.providerId === "google.com" ? "Verify with Google" : "Verify Password")
                        : "Yes, I'm sure")
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
