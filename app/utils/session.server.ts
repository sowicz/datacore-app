import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "./db.server";



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




