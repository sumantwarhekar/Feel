"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { LoginSchema, type LoginInput } from "@/lib/validations/authSchema";
import { useAuth } from "@/lib/hooks/useAuth";
import type { AppError } from "@/lib/utils/errorHandler";
import AuthCard from "@/components/auth/AuthCard";
import GoogleIcon from "@/components/auth/GoogleIcon";
import FieldError from "@/components/auth/FieldError";
import styles from "@/styles/auth.module.css";

export default function LoginPage() {
  const { signIn, signInGoogle } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      await signIn(data.email, data.password);
    } catch (err) {
      setServerError((err as AppError).message);
    }
  };

  const handleGoogle = async () => {
    setServerError(null);
    setGoogleLoading(true);
    try {
      await signInGoogle();
    } catch (err) {
      setServerError((err as AppError).message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Heading */}
      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.subtext}>Sign in to continue your journey</p>

      {/* Google */}
      <motion.button
        id="google-signin-btn"
        className={styles.googleBtn}
        onClick={handleGoogle}
        disabled={googleLoading || isSubmitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <GoogleIcon />
        {googleLoading ? "Signing in…" : "Continue with Google"}
      </motion.button>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or continue with email</span>
        <span className={styles.dividerLine} />
      </div>

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

      {/* Form */}
      <form id="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="login-email" className={styles.label}>
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div className={styles.formGroupLast}>
          <div className={styles.labelRow}>
            <label htmlFor="login-password" className={styles.label}>
              Password
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        {/* Submit */}
        <motion.button
          id="login-submit-btn"
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || googleLoading}
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </motion.button>
      </form>

      {/* Footer */}
      <p className={styles.footerText}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className={styles.link}>
          Create one free
        </Link>
      </p>
    </AuthCard>
  );
}
