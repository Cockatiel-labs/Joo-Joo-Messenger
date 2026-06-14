import type { SigninInput, SignupInput } from "@cockatiel/shared/schemas/auth/auth.schema";
import type { AuthModel } from "./model";
import * as repository from "./repository";

export async function getIsUsernameAvailable(username: string): Promise<boolean> {
  return repository.isUsernameAvailable(username);
}

export async function signIn(body: SigninInput): Promise<AuthModel["authResponse" | "errorResponse"]> {
  const user = await repository.getUserByUsername(body.username);

  if (!user)
    return {
      success: false,
      message: "Invalid username or password",
    };

  const isMatch = await Bun.password.verify(body.password, user.password);

  if (!isMatch)
    return {
      success: false,
      message: "Invalid username or password",
    };

  return {
    success: true,
    message: "Login Successfully",
    data: {
      user: {
        id: user.id,
        username: user.username,
      },
      token: "YOUR_KEY",
    },
  };
}

export async function signup(body: SignupInput): Promise<AuthModel["authResponse" | "errorResponse"]> {
  const isUsernameAvailable = await repository.isUsernameAvailable(body.username);

  if (!isUsernameAvailable)
    return {
      success: false,
      message: "Username already exists",
    };

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

    return {
      success: true,
      message: "User created successfully",
      data: {
        user,
        token: "YOUR_KEY",
      },
    };
  } catch (error: unknown) {
    const postgresError = error as {
      cause?: {
        code?: string;
      };
    };

    if (postgresError.cause?.code === "23505")
      return {
        success: false,
        message: "Username already exists",
      };

    throw error;
  }
}
