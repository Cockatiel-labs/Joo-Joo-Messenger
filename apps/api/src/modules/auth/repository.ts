import { db } from "../../db";
import { users } from "../../db/schema";

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
