/**
 * Safety guard against unbounded memory growth.
 * In-memory limiter is intended for low/medium traffic deployments.
 */
export const RATE_LIMIT_MAX_STORE_SIZE = 10_000
export const RATE_LIMIT_CLEANUP_INTERVAL = 60_000

export const DUMMY_BCRYPT_HASH =
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8U8rWvRazS4HOXEusGIE2jkTFJdK9W'