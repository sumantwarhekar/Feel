import * as z from "zod";

/* ── Register schema ─────────────────────────────────────── */
export const RegisterSchema = z
  .object({
    displayName: z
      .string()
      .min(2, { error: "Name must be at least 2 characters." })
      .max(50, { error: "Name must be under 50 characters." })
      .trim(),
    email: z.email({ error: "Please enter a valid email address." }).trim(),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
      .regex(/[0-9]/, { error: "Password must contain at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

/* ── Login schema ────────────────────────────────────────── */
export const LoginSchema = z.object({
  email:    z.email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
