"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as z from "zod";

import { useAuth } from "@/lib/hooks/useAuth";
import type { AppError } from "@/lib/utils/errorHandler";
import AuthCard from "@/components/auth/AuthCard";
import FieldError from "@/components/auth/FieldError";
import styles from "@/styles/auth.module.css";

/* ── Schema ──────────────────────────────────────────────── */
const ForgotSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
});
type ForgotInput = z.infer<typeof ForgotSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({ resolver: zodResolver(ForgotSchema) });

  const onSubmit = async (data: ForgotInput) => {
    setServerError(null);
    try {
      await resetPassword(data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      setServerError((err as AppError).message);
    }
  };

  return (
    <AuthCard>
      {/* ── Header (animates between states) ── */}
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent-header"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h1 className={styles.heading}>Check your inbox</h1>
            <p className={styles.subtext}>We sent a reset link to your email</p>
          </motion.div>
        ) : (
          <motion.div
            key="default-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className={styles.heading}>Forgot password?</h1>
            <p className={styles.subtext}>No worries, we&apos;ll send you a reset link!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body (animates between form and success) ── */}
      <AnimatePresence mode="wait">
        {sent ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.successBadge}>
              <span className={styles.successBadgeIcon}>✉️</span>
              <div>
                <p className={styles.successBadgeTitle}>Reset link sent!</p>
                <p className={styles.successBadgeEmail}>{sentEmail}</p>
              </div>
            </div>

            <p className={styles.successHelperText}>
              Click the link in the email to reset your password. If you don&apos;t see it,
              check your spam folder.
            </p>

            <motion.button
              id="resend-btn"
              className={styles.outlineBtn}
              onClick={() => { setSent(false); setServerError(null); }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Try a different email
            </motion.button>

            <Link href="/login" className={styles.backLink}>
              ← Back to Sign in
            </Link>
          </motion.div>

        ) : (
          /* ── Form state ── */
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  className={styles.errorBanner}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            <form id="forgot-password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={styles.formGroupLast}>
                <label htmlFor="forgot-email" className={styles.label}>
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <motion.button
                id="send-reset-btn"
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              >
                {isSubmitting ? "Sending…" : "Send reset link"}
              </motion.button>

              <p className={styles.footerText}>
                Remember it?{" "}
                <Link href="/login" className={styles.link}>
                  Back to Sign in
                </Link>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
