"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "@/styles/auth.module.css";

interface Props {
  children: React.ReactNode;
}

/**
 * Shared animated card container used by all auth pages.
 * Renders the green logo, page-level gradient background,
 * and the white rounded card with entry animation.
 */
export default function AuthCard({ children }: Props) {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoCircle}>🌿</div>
          </Link>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
