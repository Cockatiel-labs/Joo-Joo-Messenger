import { z } from "zod";
import { usernameRegex } from "../../constants/regex";

export const signupSchema = z
  .object({
    username: z
      .string({ error: "Username is required" })
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(usernameRegex, "Username must start with a letter and contain only letters, numbers, and underscores"),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(30, "Password must be at most 30 characters"),

    confirmPassword: z.string({ error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
