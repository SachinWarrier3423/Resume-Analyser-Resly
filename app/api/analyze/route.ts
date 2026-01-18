import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/pdf-parser";
import { analyzeResume, streamAnalysis } from "@/lib/ai-orchestrator";
import { AnalyzeRequestSchema } from "@/lib/validation";
import { createServerClient } from "@/lib/supabase";
import { formatError, getStatusCode, ValidationError } from "@/lib/errors";
import { measureAndLog } from "@/lib/logger";
import { MAX_FILE_SIZE } from "@/lib/validation";
import { toLegacyFormat, validateSchemaRobustness } from "@/lib/schema-adapter";

// Disable body parsing for streaming
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds max for AI processing

/**
 * POST /api/analyze
 * 
 * Analyzes a resume against a job description.
 * 
 * Accepts:
 * - FormData with 'resume' (PDF file) and 'jobDescription' (text)
 * - OR JSON with 'resumeText' (string) and 'jobDescription' (string)
 * 
 * Returns:
 * - Streaming JSON response with analysis results
 * - Or complete JSON response if stream=false
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  let tokensUsed: number | undefined;

  try {
    // Get user ID from auth header (if authenticated)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      // In production, verify JWT token and extract user ID
      // For now, we'll accept optional userId in request
    }

    const contentType = request.headers.get("content-type") || "";

    let resumeText: string;
    let jobDescription: string;
    let userIdFromRequest: string | undefined;

    // Handle FormData (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const resumeFile = formData.get("resume") as File | null;
      const jobDesc = formData.get("jobDescription") as string | null;
      userIdFromRequest = formData.get("userId") as string | undefined;

      if (!resumeFile) {
        throw new ValidationError("Resume file is required");
      }

      if (!jobDesc) {
        throw new ValidationError("Job description is required");
      }

      // Validate file size
      if (resumeFile.size > MAX_FILE_SIZE) {
        throw new ValidationError(
          `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
      }

      // Parse PDF
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parseResult = await parsePdf(buffer);
      resumeText = parseResult.text;
      jobDescription = jobDesc;
    } else {
      // Handle JSON body
      const body = await request.json();
      const validated = AnalyzeRequestSchema.parse(body);
      resumeText = validated.resumeText;
      jobDescription = validated.jobDescription;
      userIdFromRequest = validated.userId;
    }

    userId = userIdFromRequest;

    // Check if streaming is requested
    const streamParam = request.nextUrl.searchParams.get("stream");
    const shouldStream = streamParam === "true";

    if (shouldStream) {
      // Stream response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const encoder = new TextEncoder();

            // Send initial status (SSE format)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: "processing", message: "Analyzing resume..." })}\n\n`)
            );

            // Stream analysis results
            let finalResult: any = null;
            for await (const partialResult of streamAnalysis(resumeText, jobDescription)) {
              finalResult = partialResult;

              // Send partial results as-is (frontend can handle partial updates)
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ status: "progress", data: partialResult })}\n\n`)
              );
            }

            // Persist functionality in streaming flow
            if (finalResult && userId) {
              await persistAnalysis(userId, resumeText, jobDescription, finalResult);
            }

            // Send final complete result (convert to legacy format for frontend)
            if (finalResult) {
              try {
                // Validate it's a complete result before converting
                if (finalResult.match_score !== undefined &&
                  finalResult.ats_score !== undefined &&
                  finalResult.missing_skills !== undefined &&
                  finalResult.keyword_analysis !== undefined) {
                  const legacyResult = toLegacyFormat(finalResult);
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ status: "complete", data: legacyResult })}\n\n`)
                  );
                } else {
                  // Send as-is if incomplete
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ status: "complete", data: finalResult })}\n\n`)
                  );
                }
              } catch (error) {
                // Fallback to original format on conversion error
                console.error("Error converting to legacy format:", error);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ status: "complete", data: finalResult })}\n\n`)
                );
              }
            }

            controller.close();
          } catch (error) {
            const encoder = new TextEncoder();
            const errorMessage = formatError(error);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ status: "error", ...errorMessage })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const result = await measureAndLog(
        "/api/analyze",
        userId,
        async () => {
          const analysis = await analyzeResume(resumeText, jobDescription);

          // Validate schema robustness
          const validation = validateSchemaRobustness(analysis);
          if (!validation.valid) {
            console.warn("Schema validation issues:", validation.issues);
            // Continue anyway - log but don't fail
          }

          // Save to database if user is authenticated
          if (userId) {
            await persistAnalysis(userId, resumeText, jobDescription, analysis);
          }

          // Convert to legacy format for frontend compatibility
          return toLegacyFormat(analysis);
        },
        tokensUsed
      );

      return NextResponse.json(result, { status: 200 });
    }
  } catch (error) {
    const statusCode = getStatusCode(error);
    const errorResponse = formatError(error);

    // Log error
    const latencyMs = Date.now() - startTime;
    await import("@/lib/logger").then(({ logUsage }) =>
      logUsage({
        userId,
        endpoint: "/api/analyze",
        latencyMs,
        statusCode,
        errorMessage: errorResponse.message,
        tokensUsed,
      })
    );

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * Shared helper to persist analysis results to Supabase
 * Ensures consistency between streaming and non-streaming flows
 */
async function persistAnalysis(
  userId: string,
  resumeText: string,
  jobDescription: string,
  analysisResult: any
) {
  const supabase = createServerClient();

  // Check if user exists first to prevent foreign key constraint errors
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  // Fix: If user doesn't exist, create a placeholder record to ensure persistence handles
  // anonymous or new users correctly without violating FK constraints.
  if (!user) {
    const { error: createUserError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        email: `user_${userId}@placeholder.resly.app`, // Placeholder to satisfy schema
      } as any)
      .select()
      .single();

    if (createUserError) {
      throw new Error(`CRITICAL: Could not create placeholder user ${userId}: ${createUserError.message}`);
    }
  }

  // Save resume record
  const { data: resumeData, error: resumeError } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      file_url: "", // Pending storage bucket implementation
      parsed_text: resumeText,
      file_name: "resume.pdf",
      file_size_bytes: resumeText.length,
    } as any)
    .select()
    .single();

  if (resumeError) {
    throw new Error(`CRITICAL: Failed to save resume record: ${resumeError.message}`);
  }

  if (resumeData && (resumeData as any).id) {
    // Save analysis record
    const { error: analysisError } = await supabase.from("analyses").insert({
      resume_id: (resumeData as any).id,
      job_description: jobDescription,
      result_json: analysisResult,
      match_score: analysisResult.match_score,
      ats_score: analysisResult.ats_score,
    } as any);

    if (analysisError) {
      throw new Error(`CRITICAL: Failed to save analysis record: ${analysisError.message}`);
    }
  }
}
