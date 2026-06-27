import Csrf from "modern-csrf";

/**
 * CSRF token manager built on top of the `modern-csrf` package.
 *
 * Token format: "<secret>-<salt>"
 *  - create(): generates a new token (async, uses crypto.randomBytes for the secret)
 *  - update(token): rotates only the salt part (fast, synchronous)
 *  - verify(token1, token2): returns true when both tokens share the same secret
 *
 * This module follows the official `modern-csrf` documentation pattern:
 *  - The server generates and stores the canonical token (in memory, keyed by user ID).
 *  - The client receives the token via a cookie and echoes it back in the `x-csrf-token` header.
 *  - On each state-changing request, the server verifies the incoming token against the stored one.
 *  - After successful verification, the client token is rotated via csrf.update() and sent back.
 */
const csrf = Csrf();

export { csrf };
