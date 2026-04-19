"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updateProfile,
  type User,
  type ActionCodeSettings,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config";
import { getErrorMessage, logError } from "@/lib/utils/errorHandler";
import { setAuthCookie, clearAuthCookie } from "@/lib/utils/authCookie";

/* ── Types ──────────────────────────────────────────────── */
export interface AuthContextValue {
  user:             User | null;
  loading:          boolean;
  signUp:           (email: string, password: string, displayName: string) => Promise<void>;
  signIn:           (email: string, password: string) => Promise<void>;
  signInGoogle:     () => Promise<void>;
  resetPassword:    (email: string) => Promise<void>;
  confirmReset:     (oobCode: string, newPassword: string) => Promise<void>;
  verifyResetCode:  (oobCode: string) => Promise<string>;
  logout:           () => Promise<void>;
}

/* ── Context ─────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router                = useRouter();

  /* Listen to Firebase auth state — also syncs the middleware cookie */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) setAuthCookie();
      else clearAuthCookie();
    });
    return unsubscribe; // cleanup listener on unmount
  }, []);

  /* Create Firestore user doc if it doesn't exist yet */
  const ensureUserDoc = useCallback(async (firebaseUser: User) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         firebaseUser.uid,
        email:       firebaseUser.email,
        displayName: firebaseUser.displayName ?? "",
        photoURL:    firebaseUser.photoURL ?? "",
        createdAt:   serverTimestamp(),
        streak:      0,
        lastEntryDate: null,
        preferences: {
          reminderEnabled: false,
          reminderTime:    "20:00",
          theme:           "system",
        },
      });
    }
  }, []);

  /* Sign up with email + password */
  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(newUser, { displayName });
        // Fire-and-forget: Firestore write errors should never block redirect
        ensureUserDoc(newUser).catch((err) => logError("ensureUserDoc [signUp]", err));
        router.push("/dashboard");
      } catch (err) {
        logError("signUp", err);
        throw getErrorMessage(err);
      }
    },
    [ensureUserDoc, router]
  );

  /* Sign in with email + password */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { user: signedInUser } = await signInWithEmailAndPassword(auth, email, password);
        ensureUserDoc(signedInUser).catch((err) => logError("ensureUserDoc [signIn]", err));
        router.push("/dashboard");
      } catch (err) {
        logError("signIn", err);
        throw getErrorMessage(err);
      }
    },
    [ensureUserDoc, router]
  );

  /* Sign in with Google OAuth */
  const signInGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: googleUser } = await signInWithPopup(auth, provider);
      ensureUserDoc(googleUser).catch((err) => logError("ensureUserDoc [google]", err));
      router.push("/dashboard");
    } catch (err) {
      logError("signInGoogle", err);
      throw getErrorMessage(err);
    }
  }, [ensureUserDoc, router]);

  /* Send password reset email (30-min timestamp embedded in continueUrl) */
  const resetPassword = useCallback(async (email: string) => {
    try {
      const origin = window.location.origin;
      const actionSettings: ActionCodeSettings = {
        // continueUrl carries the sent-at timestamp for our 30-min gate
        url: `${origin}/reset-password?t=${Date.now()}`,
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, email, actionSettings);
    } catch (err) {
      logError("resetPassword", err);
      throw getErrorMessage(err);
    }
  }, []);

  /* Verify the oobCode from the reset link → returns associated email */
  const verifyResetCode = useCallback(async (oobCode: string): Promise<string> => {
    try {
      return await verifyPasswordResetCode(auth, oobCode);
    } catch (err) {
      logError("verifyResetCode", err);
      throw getErrorMessage(err);
    }
  }, []);

  /* Apply the new password using the oobCode */
  const confirmReset = useCallback(async (oobCode: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (err) {
      logError("confirmReset", err);
      throw getErrorMessage(err);
    }
  }, []);

  /* Sign out */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      logError("logout", err);
      throw getErrorMessage(err);
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInGoogle, resetPassword, confirmReset, verifyResetCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
