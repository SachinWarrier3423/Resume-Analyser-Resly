/**
 * Rate limiting utilities
 * 
 * Note: For production, consider using:
 * - Upstash Redis for distributed rate limiting
 * - Vercel Edge Config
 * - Supabase Edge Functions with rate limiting
 * 
 * This is a simple in-memory implementation for development.
 * Not suitable for production with multiple instances.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
};

// In-memory store (not suitable for production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if request should be rate limited
 * Returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Clean up expired records periodically
  if (requestCounts.size > 10000) {
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetAt < now) {
        requestCounts.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    const resetAt = now + config.windowMs;
    requestCounts.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get rate limit identifier from request
 * In production, use user ID or IP address
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    // In production, extract user ID from JWT
    return `user:${authHeader.substring(0, 20)}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

