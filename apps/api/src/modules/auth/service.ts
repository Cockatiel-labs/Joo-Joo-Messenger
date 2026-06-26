import type { SigninInput, SignupInput } from "@joo-joo/shared/schemas/auth/auth.schema";
import * as repository from "./repository";

export async function getIsUsernameAvailable(username: string) {
  return repository.isUsernameAvailable(username);
}

export async function signIn(body: SigninInput) {
  const user = await repository.getUserByUsername(body.username);

  if (!user) return null;

  const isMatch = await Bun.password.verify(body.password, user.password);

  if (!isMatch) return null;

  return user;
}

export async function signup(body: SignupInput) {
  const isUsernameAvailable = await repository.isUsernameAvailable(body.username);

  if (!isUsernameAvailable) return null;

  const argonHash = await Bun.password.hash(body.password, {
    algorithm: "argon2id",
    memoryCost: 1024 * 64, // memory usage in kb (64MiB)
    timeCost: 3, // the number of iterations
  });

  try {
    const user = await repository.createUser({
      username: body.username,
      password: argonHash,
    });
    return user;
  } catch (error) {
    console.error(error);

    return null;
  }
}
// [UPDATED] - Added changePassword feature
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await repository.getUserById(userId);
  if (!user) return false;

  const userWithPassword = await repository.getUserByUsername(user.username);
  if (!userWithPassword) return false;

  const isMatch = await Bun.password.verify(currentPassword, userWithPassword.password);
  if (!isMatch) return false;

  const argonHash = await Bun.password.hash(newPassword, {
    algorithm: "argon2id",
    memoryCost: 1024 * 64, // 64MiB
    timeCost: 3,
  });

  await repository.updateUserPassword(userId, argonHash);
  await repository.deleteAllSessionsForUser(userId);

  return true;
}
