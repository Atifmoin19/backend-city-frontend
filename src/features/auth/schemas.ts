import { z } from "zod";

/** Mirrors backend app/schemas/auth.py constraints so errors show before the request is sent. */
export const signupSchema = z.object({
  display_name: z.string().trim().min(2, "At least 2 characters").max(32, "32 characters max"),
  email: z.string().trim().toLowerCase().email("That doesn't look like an email address"),
  password: z.string().min(8, "At least 8 characters").max(128, "128 characters max"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like an email address"),
  password: z.string().min(1, "Enter your password"),
});

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
