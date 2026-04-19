"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { RegisterSchema, type RegisterInput } from "@/lib/validations/authSchema";
import { useAuth } from "@/lib/hooks/useAuth";
import type { AppError } from "@/lib/utils/errorHandler";
import AuthCard from "@/components/auth/AuthCard";
import GoogleIcon from "@/components/auth/GoogleIcon";
import FieldError from "@/components/auth/FieldError";
import PasswordStrength from "@/components/auth/PasswordStrength";
import styles from "@/styles/auth.module.css";

export default function RegisterPage() {
  const { signUp, signInGoogle } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      await signUp(data.email, data.password, data.displayName);
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
      <h1 className={styles.heading}>Start your journey</h1>
      <p className={styles.subtext}>Free forever. One line a day.</p>

      {/* Google */}
      <motion.button
        id="google-register-btn"
        className={styles.googleBtn}
        onClick={handleGoogle}
        disabled={googleLoading || isSubmitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <GoogleIcon />
        {googleLoading ? "Signing up…" : "Continue with Google"}
      </motion.button>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or register with email</span>
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
      <form id="register-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Full name */}
        <div className={styles.formGroup}>
          <label htmlFor="reg-name" className={styles.label}>
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            className={`${styles.input} ${errors.displayName ? styles.inputError : ""}`}
            {...register("displayName")}
          />
          <FieldError message={errors.displayName?.message} />
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="reg-email" className={styles.label}>
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label htmlFor="reg-password" className={styles.label}>
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            {...register("password")}
          />
          <PasswordStrength password={password} />
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirm password */}
        <div className={styles.formGroupLast}>
          <label htmlFor="reg-confirm" className={styles.label}>
            Confirm password
          </label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {/* Submit */}
        <motion.button
          id="register-submit-btn"
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || googleLoading}
          whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
        >
          {isSubmitting ? "Creating account…" : "Create free account"}
        </motion.button>
      </form>

      {/* Footer */}
      <p className={styles.footerText}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>

      <p className={styles.termsText}>
        By creating an account you agree to our{" "}
        <span className={styles.termsPlain}>Terms</span>
        {" & "}
        <span className={styles.termsPlain}>Privacy Policy</span>
      </p>
    </AuthCard>
  );
}
