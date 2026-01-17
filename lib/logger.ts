import { createServerClient } from "@/lib/supabase";

interface LogEntry {
  userId?: string;
  endpoint: string;
  tokensUsed?: number;
  latencyMs: number;
  statusCode: number;
  errorMessage?: string;
}

/**
 * Log API usage for observability
 * Non-blocking: errors are silently caught to not affect request flow
 */
export async function logUsage(entry: LogEntry): Promise<void> {
  try {
    const supabase = createServerClient();
    await supabase.from("usage_logs").insert({
      user_id: entry.userId || null,
      endpoint: entry.endpoint,
      tokens_used: entry.tokensUsed || null,
      latency_ms: entry.latencyMs,
      status_code: entry.statusCode,
      error_message: entry.errorMessage || null,
    } as any); // Type assertion needed due to strict Supabase types
  } catch (error) {
    // Silently fail - logging should never break the request
    // In production, consider using a separate logging service
    console.error("Failed to log usage:", error);
  }
}

/**
 * Measure execution time and log it
 */
export async function measureAndLog<T>(
  endpoint: string,
  userId: string | undefined,
  fn: () => Promise<T>,
  tokensUsed?: number
): Promise<T> {
  const startTime = Date.now();
  let statusCode = 200;
  let errorMessage: string | undefined;

  try {
    const result = await fn();
    return result;
  } catch (error) {
    statusCode = error instanceof Error && "statusCode" in error 
      ? (error as any).statusCode 
      : 500;
    errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw error;
  } finally {
    const latencyMs = Date.now() - startTime;
    // Log asynchronously (don't await)
    logUsage({
      userId,
      endpoint,
      tokensUsed,
      latencyMs,
      statusCode,
      errorMessage,
    }).catch(() => {
      // Ignore logging errors
    });
  }
}

