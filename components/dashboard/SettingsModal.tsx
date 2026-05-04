"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

import { useAuth } from "@/lib/hooks/useAuth";
import { auth, db } from "@/lib/firebase/config";
import { deleteAllEntries } from "@/lib/firebase/entries";
import styles from "@/styles/settings.module.css";

interface Props {
  onClose: () => void;
}

const isEmailUser = () =>
  auth.currentUser?.providerData.some((p) => p.providerId === "password") ?? false;

export default function SettingsModal({ onClose }: Props) {
  const { user, logout } = useAuth();

  /* ── Profile ── */
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [nameStatus, setNameStatus]   = useState<string | null>(null);
  const [nameSaving, setNameSaving]   = useState(false);

  /* ── Password ── */
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [pwStatus, setPwStatus]     = useState<string | null>(null);
  const [pwSaving, setPwSaving]     = useState(false);


  /* ── Danger ── */
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [dangerPw, setDangerPw]             = useState("");
  const [dangerStatus, setDangerStatus]     = useState<string | null>(null);
  const [dangerLoading, setDangerLoading]   = useState(false);

  /* ── Close on backdrop click / Escape ── */
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* ── Handlers ── */
  const saveName = async () => {
    if (!user || !displayName.trim()) return;
    setNameSaving(true);
    setNameStatus(null);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setNameStatus("saved");
    } catch {
      setNameStatus("error");
    } finally {
      setNameSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user?.email || !currentPw || !newPw) return;
    setPwSaving(true);
    setPwStatus(null);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setPwStatus("saved");
      setCurrentPw("");
      setNewPw("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setPwStatus(msg.includes("wrong-password") || msg.includes("invalid-credential")
        ? "wrong-password"
        : "error");
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteEntries = async () => {
    if (!user) return;
    setDangerLoading(true);
    setDangerStatus(null);
    try {
      await deleteAllEntries(user.uid);
      setConfirmDelete(false);
      setDangerStatus("entries-deleted");
    } catch {
      setDangerStatus("error");
    } finally {
      setDangerLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDangerLoading(true);
    setDangerStatus(null);
    try {
      if (isEmailUser()) {
        if (!dangerPw) { setDangerStatus("need-password"); setDangerLoading(false); return; }
        const cred = EmailAuthProvider.credential(user.email!, dangerPw);
        await reauthenticateWithCredential(user, cred);
      }
      await deleteAllEntries(user.uid);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      await logout();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setDangerStatus(msg.includes("wrong-password") || msg.includes("invalid-credential")
        ? "wrong-password"
        : "error");
      setDangerLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={backdropRef}
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Settings</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className={styles.body}>

            {/* ── Profile ── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Profile</h3>
              <div className={styles.field}>
                <label className={styles.label}>Display name</label>
                <div className={styles.row}>
                  <input
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); setNameStatus(null); }}
                    placeholder="Your name"
                  />
                  <button
                    className={styles.saveBtn}
                    onClick={saveName}
                    disabled={nameSaving || !displayName.trim()}
                  >
                    {nameSaving ? "Saving…" : "Save"}
                  </button>
                </div>
                {nameStatus === "saved" && <p className={styles.success}>Name updated.</p>}
                {nameStatus === "error"  && <p className={styles.error}>Something went wrong.</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={`${styles.input} ${styles.inputReadOnly}`} value={user?.email ?? ""} readOnly />
              </div>
            </section>

            <div className={styles.divider} />

            {/* ── Security ── */}
            {isEmailUser() && (
              <>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Security</h3>
                  <div className={styles.field}>
                    <label className={styles.label}>Current password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={currentPw}
                      onChange={(e) => { setCurrentPw(e.target.value); setPwStatus(null); }}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>New password</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={newPw}
                      onChange={(e) => { setNewPw(e.target.value); setPwStatus(null); }}
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    className={styles.saveBtn}
                    onClick={changePassword}
                    disabled={pwSaving || !currentPw || !newPw}
                  >
                    {pwSaving ? "Updating…" : "Change password"}
                  </button>
                  {pwStatus === "saved"          && <p className={styles.success}>Password updated.</p>}
                  {pwStatus === "wrong-password" && <p className={styles.error}>Current password is incorrect.</p>}
                  {pwStatus === "error"          && <p className={styles.error}>Something went wrong.</p>}
                </section>
                <div className={styles.divider} />
              </>
            )}

            {/* ── Danger zone ── */}
            <section className={styles.section}>
              <h3 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger zone</h3>

              {/* Delete entries */}
              {dangerStatus === "entries-deleted" ? (
                <p className={styles.success}>All entries deleted.</p>
              ) : !confirmDelete ? (
                <button className={styles.dangerBtn} onClick={() => setConfirmDelete(true)}>
                  Delete all entries
                </button>
              ) : (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Are you sure? This cannot be undone.</span>
                  <button className={styles.dangerBtnSolid} onClick={handleDeleteEntries} disabled={dangerLoading}>
                    {dangerLoading ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)}>Cancel</button>
                </div>
              )}

              {/* Delete account */}
              {!confirmAccount ? (
                <button
                  className={styles.dangerBtn}
                  style={{ marginTop: 10 }}
                  onClick={() => { setConfirmAccount(true); setDangerStatus(null); }}
                >
                  Delete account
                </button>
              ) : (
                <div className={styles.dangerBlock}>
                  <p className={styles.confirmText}>This will permanently delete your account and all data.</p>
                  {isEmailUser() && (
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Enter password to confirm"
                      value={dangerPw}
                      onChange={(e) => { setDangerPw(e.target.value); setDangerStatus(null); }}
                    />
                  )}
                  <div className={styles.row}>
                    <button className={styles.dangerBtnSolid} onClick={handleDeleteAccount} disabled={dangerLoading}>
                      {dangerLoading ? "Deleting…" : "Delete my account"}
                    </button>
                    <button className={styles.cancelBtn} onClick={() => { setConfirmAccount(false); setDangerPw(""); }}>
                      Cancel
                    </button>
                  </div>
                  {dangerStatus === "wrong-password" && <p className={styles.error}>Password is incorrect.</p>}
                  {dangerStatus === "need-password"  && <p className={styles.error}>Please enter your password.</p>}
                  {dangerStatus === "error"          && <p className={styles.error}>Something went wrong.</p>}
                </div>
              )}
            </section>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
