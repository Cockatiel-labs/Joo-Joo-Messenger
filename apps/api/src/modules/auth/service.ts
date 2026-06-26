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
