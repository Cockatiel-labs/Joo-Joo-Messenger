import { rateLimit } from "elysia-rate-limit";
import { app } from "..";

export const shortRateLimit = rateLimit({
  max: 10,
  duration: 1 * 60 * 1000,
  injectServer: () => app.server,
});

export const mediumRateLimit = rateLimit({
  max: 50,
  duration: 10 * 60 * 1000,
  injectServer: () => app.server,
});

export const authRateLimit = rateLimit({
  max: 10,
  duration: 15 * 60 * 1000,
  scoping: "scoped",
  injectServer: () => app.server,
});
