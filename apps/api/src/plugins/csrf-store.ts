/**
 * In-memory CSRF token store.
 *
 * Maps user ID → canonical CSRF token (the server-side source of truth).
 *
 * This is the lightest practical storage for the `modern-csrf` pattern described
 * in its docs ("keep it in a memory storage"). For multi-instance deployments,
 * replace this with a Redis-backed map or similar.
 */
const csrfTokens = new Map<string, string>();

/**
 * Store a CSRF token for a user.
 */
export function setCsrfToken(userId: string, token: string): void {
  csrfTokens.set(userId, token);
}

/**
 * Retrieve the stored CSRF token for a user.
 * Returns undefined if no token is stored.
 */
export function getCsrfToken(userId: string): string | undefined {
  return csrfTokens.get(userId);
}

/**
 * Remove the stored CSRF token for a user (e.g., on logout).
 */
export function deleteCsrfToken(userId: string): void {
  csrfTokens.delete(userId);
}
