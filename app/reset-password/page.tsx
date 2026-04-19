"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as z from "zod";

import { useAuth } from "@/lib/hooks/useAuth";
import type { AppError } from "@/lib/utils/errorHandler";
import AuthCard from "@/components/auth/AuthCard";
import FieldError from "@/components/auth/FieldError";
import PasswordStrength from "@/components/auth/PasswordStrength";
import styles from "@/styles/auth.module.css";

/* ── Constants ───────────────────────────────────────────── */
const THIRTY_MIN_MS = 30 * 60 * 1000;

/* ── Schema ──────────────────────────────────────────────── */
const ResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { error: "Must contain at least one letter." })
      .regex(/[0-9]/, { error: "Must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetInput = z.infer<typeof ResetSchema>;
type PageState = "loading" | "form" | "expired" | "invalid" | "success";

/* ── Inner content — uses useSearchParams, needs Suspense ── */
function ResetPasswordContent() {
  const { verifyResetCode, confirmReset } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const oobCode     = searchParams.get("oobCode");
  const mode        = searchParams.get("mode");
  const continueUrl = searchParams.get("continueUrl");

  const [pageState, setPageState]       = useState<PageState>("loading");
  const [userEmail, setUserEmail]       = useState("");
  const [serverError, setServerError]   = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({ resolver: zodResolver(ResetSchema) });

  const password = watch("password", "");

  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setPageState("invalid");
      return;
    }

    // 30-minute gate: timestamp embedded in continueUrl query param `?t=<ms>`
    if (continueUrl) {
      try {
        const t = new URL(continueUrl).searchParams.get("t");
        if (t && Date.now() - parseInt(t, 10) > THIRTY_MIN_MS) {
          setPageState("expired");
          return;
        }
      } catch {
        // malformed continueUrl — skip 30-min check and proceed
      }
    }

    verifyResetCode(oobCode)
      .then((email) => { setUserEmail(email); setPageState("form"); })
      .catch(() => setPageState("invalid"));
  }, [oobCode, mode, continueUrl, verifyResetCode]);

  const onSubmit = async (data: ResetInput) => {
    if (!oobCode) return;
    setServerError(null);
    try {
      await confirmReset(oobCode, data.password);
      setPageState("success");
    } catch (err) {
      setServerError((err as AppError).message);
    }
  };

  /* ── Loading ── */
  if (pageState === "loading") {
    return (
      <AuthCard>
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <p className={styles.spinnerText}>Verifying your link…</p>
      </AuthCard>
    );
  }

  /* ── Invalid / Expired ── */
  if (pageState === "invalid" || pageState === "expired") {
    const isExpired = pageState === "expired";
    return (
      <AuthCard>
        <h1 className={styles.heading}>
          {isExpired ? "Link expired" : "Invalid link"}
        </h1>
        <p className={`${styles.subtext} ${styles.formGroupLast}`}>
          {isExpired
            ? "This password reset link expired after 30 minutes. Request a new one."
            : "This reset link is invalid or has already been used."}
        </p>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link href="/forgot-password" className={styles.submitLink}>
            Request new link
          </Link>
        </motion.div>
        <Link href="/login" className={`${styles.backLink} ${styles.formGroup}`}>
          ← Back to Sign in
        </Link>
      </AuthCard>
    );
  }

  /* ── Success ── */
  if (pageState === "success") {
    return (
      <AuthCard>
        <motion.div
          className={styles.successIconCircle}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          ✅
        </motion.div>
        <h1 className={styles.heading}>Password updated!</h1>
        <p className={`${styles.subtext} ${styles.formGroupLast}`}>
          Your password has been reset successfully. Sign in with your new password.
        </p>
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link href="/login" className={styles.submitLink}>
            Sign in
          </Link>
        </motion.div>
      </AuthCard>
    );
  }

  /* ── Form ── */
  return (
    <AuthCard>
      <h1 className={styles.heading}>Set new password</h1>
      {userEmail && (
        <p className={styles.userEmail}>
          for <strong className={styles.userEmailStrong}>{userEmail}</strong>
        </p>
      )}

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

      <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* New password */}
        <div className={styles.formGroup}>
          <label htmlFor="new-password" className={styles.label}>
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            autoFocus
            placeholder="Min. 8 characters"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            {...register("password")}
          />
          <PasswordStrength password={password} />
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm password */}
        <div className={styles.formGroupLast}>
          <label htmlFor="confirm-password" className={styles.label}>
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <motion.button
          id="reset-submit-btn"
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
        >
          {isSubmitting ? "Updating password…" : "Update password"}
        </motion.button>

        <Link href="/login" className={styles.backLink}>
          ← Back to Sign in
        </Link>
      </form>
    </AuthCard>
  );
}

/* ── Page — Suspense required for useSearchParams ─────────── */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <motion.div
            className={styles.spinner}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
