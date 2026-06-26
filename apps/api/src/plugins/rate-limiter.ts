import { rateLimit } from "elysia-rate-limit";
import { app } from "..";

export const shortRateLimit = rateLimit({
  max: 10,
  duration: 1 * 60 * 1000, // 1 mintue
  injectServer: () => app.server,
});

export const mediumRateLimit = rateLimit({
  max: 50,
  duration: 10 * 60 * 1000, // 10 mintue
  injectServer: () => app.server,
});

export const authRateLimit = rateLimit({
  max: 10,
  duration: 15 * 60 * 1000, // 15 mintue
  injectServer: () => app.server,
});

export const refreshTokenRateLimit = rateLimit({
  max: 5,
  duration: 30 * 60 * 1000, // 30 mintue
  injectServer: () => app.server,
});
