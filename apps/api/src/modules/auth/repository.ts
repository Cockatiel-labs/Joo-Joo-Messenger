import { eq } from "drizzle-orm";
import { db } from "../../db";
import { sessions, users } from "../../db/schema";

export async function isUsernameAvailable(username: string) {
  const user = await db.query.users.findFirst({
    columns: { id: true },
    where: (user, { eq }) => eq(user.username, username),
  });

  return user === undefined;
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    columns: {
      id: true,
      username: true,
    },
    where: (user, { eq }) => eq(user.id, id),
  });
}

export async function getUserByUsername(username: string) {
  return db.query.users.findFirst({
    columns: {
      id: true,
      username: true,
      password: true,
    },
    where: (user, { eq }) => eq(user.username, username),
  });
}

export async function createUser(data: { username: string; password: string }) {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    username: users.username,
  });

  return user;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await db.update(users).set({ password: passwordHash }).where(eq(users.id, userId));
}

// ─── Session Management ───────────────────────────────────────────

export async function createSession(data: {
  userId: string;
  userAgent?: string;
  refreshTokenHash?: string;
  expiresAt?: Date;
}) {
  const [session] = await db.insert(sessions).values(data).returning();
  return session;
}

export async function getSessionById(id: string) {
  return db.query.sessions.findFirst({
    where: (session, { eq }) => eq(session.id, id),
  });
}

export async function storeRefreshToken(sessionId: string, refreshTokenHash: string) {
  await db.update(sessions).set({ refreshTokenHash, lastUsedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function revokeSession(sessionId: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function deleteSession(id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function deleteAllSessionsForUser(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function getAllSessionsForUser(userId: string) {
  return db.query.sessions.findMany({
    where: (session, { eq }) => eq(session.userId, userId),
  });
}
