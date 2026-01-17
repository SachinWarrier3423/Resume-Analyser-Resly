import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { formatError, getStatusCode, UnauthorizedError } from "@/lib/errors";
import { measureAndLog } from "@/lib/logger";

/**
 * GET /api/history
 * 
 * Returns saved analyses for the authenticated user.
 * 
 * Query params:
 * - limit: number of results (default: 20, max: 100)
 * - offset: pagination offset (default: 0)
 * 
 * Returns:
 * - Array of analysis summaries sorted by date (newest first)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  try {
    // Get user ID from auth header or query param
    // In production, verify JWT token from authorization header
    const authHeader = request.headers.get("authorization");
    const userIdParam = request.nextUrl.searchParams.get("userId");

    if (!authHeader && !userIdParam) {
      // For now, allow unauthenticated requests (return empty array)
      // In production, require authentication
      return NextResponse.json([], { status: 200 });
    }

    userId = userIdParam || undefined;

    // Get pagination params
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get("limit") || "20"),
      100
    );
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    const result = await measureAndLog(
      "/api/history",
      userId,
      async () => {
        const supabase = createServerClient();

        // Fetch analyses with resume info
        // Note: In production, use RLS policies and user JWT
        // For now, we'll filter by user_id directly
        const { data: analyses, error } = await supabase
          .from("analyses")
          .select(
            `
            id,
            match_score,
            ats_score,
            created_at,
            job_description,
            resumes!inner(user_id)
          `
          )
          .eq("resumes.user_id", userId || "")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          throw new Error(`Database query failed: ${error.message}`);
        }

        // Transform to response format
        // Extract job title from job description (simple heuristic)
        const history = ((analyses || []) as any[]).map((analysis: any) => {
          const jobDesc = analysis.job_description || "";
          // Try to extract job title from first line or common patterns
          const titleMatch = jobDesc.match(/^(?:Job Title|Position|Role):\s*(.+?)(?:\n|$)/i);
          const companyMatch = jobDesc.match(/(?:at|Company):\s*(.+?)(?:\n|$)/i);

          return {
            id: analysis.id,
            jobTitle: titleMatch?.[1]?.trim() || "Untitled Position",
            company: companyMatch?.[1]?.trim(),
            matchScore: analysis.match_score,
            atsScore: analysis.ats_score,
            createdAt: analysis.created_at,
          };
        });

        return history;
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const statusCode = getStatusCode(error);
    const errorResponse = formatError(error);

    // Log error
    const latencyMs = Date.now() - startTime;
    await import("@/lib/logger").then(({ logUsage }) =>
      logUsage({
        userId,
        endpoint: "/api/history",
        latencyMs,
        statusCode,
        errorMessage: errorResponse.message,
      })
    );

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

