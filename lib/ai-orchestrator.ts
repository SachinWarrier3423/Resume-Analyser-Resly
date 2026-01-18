import Groq from "groq-sdk";
import { AnalysisResultSchema, type AnalysisResult } from "@/lib/validation";
import { z } from "zod";

// Lazy-initialize Groq client to avoid build-time errors when GROQ_API_KEY is not set
// (Vercel/build doesn't have env vars; they're only available at runtime)
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }
  return new Groq({ apiKey });
}

// Model configuration - optimized for deterministic JSON output
// Using llama-3.3-70b-versatile as llama-3.1-70b-versatile is decommissioned
const MODEL = "llama-3.3-70b-versatile"; // Fast, capable, JSON-optimized
const MAX_TOKENS = 2000; // Reduced for faster, more focused responses
const TEMPERATURE = 0.1; // Very low temperature for deterministic outputs
const MAX_RETRIES = 3; // Maximum retries for malformed JSON

/**
 * Deterministic system prompt enforcing strict JSON-only output
 * No markdown, no explanations, just structured data
 */
const SYSTEM_PROMPT = `You are a resume analysis inference engine. Your only job is to output valid JSON.

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no code blocks.
2. Use EXACTLY these keys: match_score, missing_skills, ats_score, keyword_analysis, resume_strengths, improvements, role_fit_summary
3. All scores are integers 0-100
4. All arrays are arrays of strings (except keyword_analysis which has present/missing arrays)
5. role_fit_summary is a single string, 50-500 characters
6. Be conservative and realistic in scoring
7. Missing skills should be specific and actionable
8. Improvements should be concrete and prioritized

Your response must be parseable as JSON with no preprocessing.`;

/**
 * Analyze resume against job description using Groq AI
 * Returns structured analysis result with automatic retry on malformed output
 */
export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  retryCount: number = 0
): Promise<AnalysisResult> {
  const groq = getGroqClient();
  const prompt = buildAnalysisPrompt(resumeText, jobDescription);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI model");
    }

    // Clean content - remove any markdown code blocks if present
    const cleanedContent = cleanJsonContent(content);

    // Parse and validate JSON response
    let parsedResult: unknown;
    try {
      parsedResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      // Retry on JSON parse errors
      if (retryCount < MAX_RETRIES) {
        console.warn(`JSON parse error, retrying (${retryCount + 1}/${MAX_RETRIES})`);
        return analyzeResume(resumeText, jobDescription, retryCount + 1);
      }
      throw new Error(`Invalid JSON response from AI model after ${MAX_RETRIES} retries`);
    }

    // Validate against schema
    try {
      const validatedResult = AnalysisResultSchema.parse(parsedResult);
      return validatedResult;
    } catch (validationError) {
      // Retry on schema validation errors
      if (retryCount < MAX_RETRIES && validationError instanceof z.ZodError) {
        console.warn(
          `Schema validation error: ${validationError.errors.map((e) => e.path.join(".")).join(", ")}, retrying (${retryCount + 1}/${MAX_RETRIES})`
        );
        return analyzeResume(resumeText, jobDescription, retryCount + 1);
      }
      throw new Error(
        `Schema validation failed: ${validationError instanceof z.ZodError ? validationError.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ") : "Unknown error"}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      // Don't retry on non-JSON errors (API errors, etc.)
      if (error.message.includes("JSON") || error.message.includes("Schema")) {
        if (retryCount < MAX_RETRIES) {
          return analyzeResume(resumeText, jobDescription, retryCount + 1);
        }
      }
      throw new Error(`AI analysis failed: ${error.message}`);
    }
    throw new Error("AI analysis failed: Unknown error");
  }
}

/**
 * Stream analysis results for real-time updates
 * Handles partial JSON chunks gracefully
 */
export async function* streamAnalysis(
  resumeText: string,
  jobDescription: string
): AsyncGenerator<Partial<AnalysisResult>, void, unknown> {
  const groq = getGroqClient();
  const prompt = buildAnalysisPrompt(resumeText, jobDescription);

  try {
    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" },
      stream: true,
    });

    let accumulatedContent = "";
    let lastValidPartial: Partial<AnalysisResult> | null = null;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        accumulatedContent += content;

        // Try to parse partial JSON (for streaming updates)
        // Use a more lenient approach for partial parsing
        try {
          const cleaned = cleanJsonContent(accumulatedContent);
          const partial = JSON.parse(cleaned);
          
          // Only yield if we have new meaningful data
          if (hasNewData(partial, lastValidPartial)) {
            lastValidPartial = partial as Partial<AnalysisResult>;
            yield lastValidPartial;
          }
        } catch {
          // Not yet valid JSON, continue accumulating
          // Try to extract partial values from incomplete JSON
          const partial = extractPartialJson(accumulatedContent);
          if (partial && hasNewData(partial, lastValidPartial)) {
            lastValidPartial = partial;
            yield lastValidPartial;
          }
        }
      }
    }

    // Final validation of complete result
    if (!accumulatedContent) {
      throw new Error("Empty response from AI stream");
    }

    const cleanedContent = cleanJsonContent(accumulatedContent);
    const finalResult = JSON.parse(cleanedContent);
    const validatedResult = AnalysisResultSchema.parse(finalResult);
    yield validatedResult;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Streaming analysis failed: ${error.message}`);
    }
    throw new Error("Streaming analysis failed: Unknown error");
  }
}

/**
 * Build deterministic analysis prompt
 * Focused on extracting structured insights
 */
function buildAnalysisPrompt(resumeText: string, jobDescription: string): string {
  // Truncate inputs to stay within token limits
  const maxResumeLength = 2500;
  const maxJobDescLength = 1500;

  const truncatedResume =
    resumeText.length > maxResumeLength
      ? resumeText.substring(0, maxResumeLength) + "..."
      : resumeText;

  const truncatedJobDesc =
    jobDescription.length > maxJobDescLength
      ? jobDescription.substring(0, maxJobDescLength) + "..."
      : jobDescription;

  return `Analyze this resume against the job description.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJobDesc}

Output JSON with this exact structure:
{
  "match_score": <0-100 integer>,
  "missing_skills": ["skill1", "skill2"],
  "ats_score": <0-100 integer>,
  "keyword_analysis": {
    "present": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "resume_strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "role_fit_summary": "<50-500 character summary>"
}

Guidelines:
- match_score: Overall fit (0-100). Be conservative.
- missing_skills: Required skills not in resume. Be specific.
- ats_score: ATS compatibility (0-100). Consider formatting, keywords, structure.
- keyword_analysis: Extract important keywords from job description. Categorize as present/missing.
- resume_strengths: What makes this resume strong for this role.
- improvements: Prioritized, actionable improvements. Be concrete.
- role_fit_summary: Concise assessment of fit. Professional tone.`;
}

/**
 * Clean JSON content - remove markdown code blocks if present
 */
function cleanJsonContent(content: string): string {
  // Remove markdown code blocks
  let cleaned = content.trim();
  
  // Remove ```json or ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Find JSON object boundaries
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

/**
 * Extract partial JSON values from incomplete JSON string
 * Used for streaming updates
 */
function extractPartialJson(content: string): Partial<AnalysisResult> | null {
  const partial: Partial<AnalysisResult> = {};
  
  // Try to extract numeric values
  const matchScoreMatch = content.match(/"match_score"\s*:\s*(\d+)/);
  if (matchScoreMatch) {
    partial.match_score = parseInt(matchScoreMatch[1], 10);
  }
  
  const atsScoreMatch = content.match(/"ats_score"\s*:\s*(\d+)/);
  if (atsScoreMatch) {
    partial.ats_score = parseInt(atsScoreMatch[1], 10);
  }
  
  // Try to extract arrays (simplified - just check if they exist)
  if (content.includes('"missing_skills"')) {
    partial.missing_skills = [];
  }
  
  if (content.includes('"resume_strengths"')) {
    partial.resume_strengths = [];
  }
  
  if (content.includes('"improvements"')) {
    partial.improvements = [];
  }
  
  // Only return if we have at least one meaningful value
  if (Object.keys(partial).length > 0) {
    return partial;
  }
  
  return null;
}

/**
 * Check if new partial data has meaningful updates
 */
function hasNewData(
  newPartial: Partial<AnalysisResult>,
  lastPartial: Partial<AnalysisResult> | null
): boolean {
  if (!lastPartial) return true;
  
  // Check if scores changed
  if (
    (newPartial.match_score !== undefined &&
      newPartial.match_score !== lastPartial.match_score) ||
    (newPartial.ats_score !== undefined &&
      newPartial.ats_score !== lastPartial.ats_score)
  ) {
    return true;
  }
  
  // Check if arrays have more items
  if (
    (newPartial.missing_skills?.length || 0) >
      (lastPartial.missing_skills?.length || 0) ||
    (newPartial.resume_strengths?.length || 0) >
      (lastPartial.resume_strengths?.length || 0) ||
    (newPartial.improvements?.length || 0) >
      (lastPartial.improvements?.length || 0)
  ) {
    return true;
  }
  
  // Check if summary exists and is different
  if (
    newPartial.role_fit_summary &&
    newPartial.role_fit_summary !== lastPartial.role_fit_summary
  ) {
    return true;
  }
  
  return false;
}

/**
 * Get token usage from Groq response (for logging)
 */
export function getTokenUsage(completion: any): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
  return {
    promptTokens: completion.usage?.prompt_tokens || 0,
    completionTokens: completion.usage?.completion_tokens || 0,
    totalTokens: completion.usage?.total_tokens || 0,
  };
}
