import bcrypt from "bcryptjs";
import { z } from "zod"
import { db } from "./db.server";


interface ValidationError {
  formErrors: string[];
}

export interface ValidationResult<T> {
  success: boolean;
  errors?: T;
}


// ----------- Function to validate the username -------------
// -----------------------------------------------------------

export function validateUsername(username: string): ValidationResult<ValidationError> {
  const usernameSchema = z
    .string()
    .min(6, "Must be at least 6 characters long")
    .max(16, "Must be at most 16 characters long")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/^\S*$/, "Username cannot contain spaces");

  const result = usernameSchema.safeParse(username);

  if (!result.success) {
    return { success: false, errors: result.error.flatten() };
  }

  return { success: true };
}


// ----------- Function to validate actual password -------------
// --------------------------------------------------------------

export async function validateActualPassword(id: string, password: string): Promise<ValidationResult<ValidationError>> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return {
      success: false, 
      errors: {formErrors: ["User not validated"]}
      }
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return {
      success: false, 
      errors: {formErrors: ["Password incorrect"]}
      }
  } else {
    return { success: true}
  }
}


// ----------- Function to validate the password ----------------
// --------------------------------------------------------------

export function validatePassword(password: string): ValidationResult<ValidationError> {
  const passwordSchema = z
    .string()
    .min(8, "Must be at least 8 characters long")
    .max(32, "Must be at most 32 characters long")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/^\S*$/, "Password cannot contain spaces")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

  const result = passwordSchema.safeParse(password);

  if (!result.success) {
    return { success: false, errors: result.error.flatten() };
  }

  return { success: true };
}



// ----------- Function to compare passwords --------------------
// --------------------------------------------------------------

export function comparePasswords(password: string, confirmPassword: string): ValidationResult<string> {
  if (password !== confirmPassword) {
    return { success: false, errors: "Passwords do not match" };
  }

  return { success: true };
}



