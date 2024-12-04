import bcrypt from "bcryptjs";
import { z } from "zod"

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "./db.server";


interface ValidationError {
  formErrors: string[];
}

export interface ValidationResult<T> {
  success: boolean;
  errors?: T;
}

// Function to validate the username
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



// Function to validate actual password

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




// Function to validate the password
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


// Function to compare passwords
export function comparePasswords(password: string, confirmPassword: string): ValidationResult<string> {
  if (password !== confirmPassword) {
    return { success: false, errors: "Passwords do not match" };
  }

  return { success: true };
}



//---------- REGISTER USER

export type LoginForm = {
  username : string;
  password: string;
  role: string;
};

export async function register({ username , password, role }: LoginForm) {
  const salt = bcrypt.genSaltSync(12)
  const passwordHash = await bcrypt.hash(password, salt);
  
  
  const user = await db.user.create({ 
    data: {
      username: username,
      password: passwordHash,
      role: role
    },
  } )
  console.log(user)
}



// ------- Change password 

export type changePasswordForm = {
  id : string | undefined;
  password: string;
};


export async function changePassword({ id , password }: changePasswordForm) {
  const salt = bcrypt.genSaltSync(12)
  const passwordHash = await bcrypt.hash(password, salt);
  

  const user = await db.user.update({
    where: { id },
    data: {
      password: passwordHash,
    },
  });
  console.log(user)
}




// --------- DELETE USER

export type deleteUserForm = {
  id : string ;
  currentUserPassword: string;
  idToDel: string;
};

export async function deleteUser({id, currentUserPassword, idToDel} : deleteUserForm ) {
  const actualUser = await db.user.findUnique({ where: { id } });

  // Validate the current user exists
  if (!actualUser) {
    return { success: false, error: "Wrong user, sorry" };
  }

  // Check if the provided password matches
  const isValid = await bcrypt.compare(currentUserPassword, actualUser.password);
  if (!isValid) {
    return { success: false, error: "Incorrect password." };
  }
  
  // Attempt to delete the target user
  try {
    await db.user.delete({
      where: { id: idToDel },
    });
    return { success: true }; // Deletion successful
  } catch (err) {
    return { success: false, error: "Failed to delete the user." }; // Deletion error
  }
}



//---------- LOGIN USER

const sessionSecret = process.env.SESSION_SECRET || "defaultsecret";

const storage = createCookieSessionStorage({
  cookie: {
    name: "session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});



export async function login({ username, password }: { username: string; password: string }) {
  const user = await db.user.findUnique({ where: { username } });

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Update last login time
  await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return { id: user.id, username: user.username, role: user.role };
};



export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};



export async function getUser(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await storage.getSession(cookie);

  const userId = session.get("userId");
  if (!userId) return null;

  return db.user.findUnique({ where: { id: userId } });
}



export async function destroyUserSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await storage.getSession(cookie);

  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}




// ------------- DELETE LINK

// --------- DELETE USER

export type deleteLinkForm = {
  id : string ;
  currentUserPassword: string;
  idToDel: number;
};

export async function deleteLink({id, currentUserPassword, idToDel} : deleteUserForm ) {
  const actualUser = await db.user.findUnique({ where: { id } });

  // Validate the current user exists
  if (!actualUser) {
    return { success: false, error: "Wrong user, sorry" };
  }

  // Check if the provided password matches
  const isValid = await bcrypt.compare(currentUserPassword, actualUser.password);
  if (!isValid) {
    return { success: false, error: "Incorrect password." };
  }
  
  // Attempt to delete the target user
  try {
    await db.links.delete({
      where: { id: Number(idToDel) },
    });
    return { success: true }; // Deletion successful
  } catch (err) {
    return { success: false, error: "Failed to delete the user." }; // Deletion error
  }
}
