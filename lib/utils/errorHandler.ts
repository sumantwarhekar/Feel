/* ── Centralized error handler ───────────────────────────── *
 * Converts Firebase Auth error codes and generic errors     *
 * into human-readable messages suitable for UI display.     *
 * ────────────────────────────────────────────────────────── */

const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  "auth/email-already-in-use":    "An account with this email already exists.",
  "auth/invalid-email":           "The email address is not valid.",
  "auth/user-disabled":           "This account has been disabled. Contact support.",
  "auth/user-not-found":          "No account found with this email.",
  "auth/wrong-password":          "Incorrect password. Please try again.",
  "auth/invalid-credential":      "Invalid email or password.",
  "auth/too-many-requests":       "Too many failed attempts. Please try again later.",
  "auth/network-request-failed":  "Network error. Please check your connection.",
  "auth/popup-closed-by-user":    "Sign-in popup was closed before completing.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/popup-blocked":           "Sign-in popup was blocked by your browser.",
  "auth/weak-password":           "Password is too weak. Use at least 8 characters.",
};

export interface AppError {
  message: string;
  code?: string;
}

/**
 * Returns a user-friendly error message from any thrown error.
 */
export function getErrorMessage(error: unknown): AppError {
  // Firebase AuthError
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: string }).code;
    const message = FIREBASE_AUTH_ERRORS[code] ?? "An unexpected error occurred.";
    return { message, code };
  }

  // Standard JS Error
  if (error instanceof Error) {
    return { message: error.message };
  }

  // String thrown
  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "An unexpected error occurred. Please try again." };
}

/**
 * Logs errors in development with full context.
 * In production, this would forward to a logging service.
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Feel Error] ${context}:`, error);
  }
  // TODO: Forward to Sentry / Vercel monitoring in production
}
