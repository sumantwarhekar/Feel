"use client";

import { motion } from "framer-motion";
import styles from "@/styles/auth.module.css";

interface Props {
  /** The raw password string to score */
  password: string;
}

const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"] as const;
const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"] as const;

/**
 * Animated 4-bar password strength indicator.
 * Evaluates: length ≥ 8, letters, numbers, special chars.
 */
export default function PasswordStrength({ password }: Props) {
  if (!password) return null;

  const score = [
    password.length >= 8,
    /[a-zA-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  const color = STRENGTH_COLORS[score - 1];

  return (
    <div>
      <div className={styles.strengthBars}>
        {([0, 1, 2, 3] as const).map((i) => (
          <motion.div
            key={i}
            className={styles.strengthBar}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i < score ? 1 : 0 }}
            style={{ background: i < score ? color : undefined }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={styles.strengthLabel} style={{ color }}>
          {STRENGTH_LABELS[score - 1]}
        </p>
      )}
    </div>
  );
}
