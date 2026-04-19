import styles from "@/styles/auth.module.css";

interface Props {
  message?: string;
}

/**
 * Displays a single field-level validation error below an input.
 * Renders nothing when message is undefined or empty.
 */
export default function FieldError({ message }: Props) {
  if (!message) return null;
  return <p className={styles.fieldError}>{message}</p>;
}
