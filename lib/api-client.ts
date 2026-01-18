/**
 * API Client for frontend
 * Handles all API communication with proper error handling
 */

import type { LegacyAnalysisResult } from "@/lib/validation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface AnalyzeResponse extends LegacyAnalysisResult {
  id?: string;
  createdAt?: string;
}

export interface AnalyzeError {
  error: string;
  message: string;
  code?: string;
}

/**
 * Analyze resume - non-streaming
 */
export async function analyzeResume(
  resumeFile: File,
  jobDescription: string,
  userId?: string
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  if (userId) {
    formData.append("userId", userId);
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: AnalyzeError = await response.json().catch(() => ({
      error: "UnknownError",
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "Analysis failed");
  }

  return response.json();
}

/**
 * Analyze resume with streaming
 * Returns an async generator for real-time updates
 */
export async function* analyzeResumeStream(
  resumeFile: File,
  jobDescription: string,
  userId?: string
): AsyncGenerator<Partial<AnalyzeResponse>, void, unknown> {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  if (userId) {
    formData.append("userId", userId);
  }

  const response = await fetch(`${API_BASE_URL}/analyze?stream=true`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: AnalyzeError = await response.json().catch(() => ({
      error: "UnknownError",
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "Streaming analysis failed");
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.status === "progress" && data.data) {
              yield data.data;
            } else if (data.status === "complete" && data.data) {
              yield data.data;
              return;
            } else if (data.status === "error") {
              throw new Error(data.message || "Analysis error");
            }
          } catch (error) {
            // Skip invalid JSON lines
            if (error instanceof SyntaxError) continue;
            throw error;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get analysis history
 */
export async function getAnalysisHistory(
  userId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<Array<{
  id: string;
  jobTitle: string;
  company?: string;
  matchScore: number;
  atsScore: number;
  createdAt: string;
}>> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (userId) {
    params.append("userId", userId);
  }

  const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`);

  if (!response.ok) {
    const error: AnalyzeError = await response.json().catch(() => ({
      error: "UnknownError",
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || "Failed to fetch history");
  }

  return response.json();
}

/**
 * Get single analysis by ID
 */
export async function getAnalysisById(analysisId: string): Promise<AnalyzeResponse> {
  // For now, we'll need to fetch from history and find by ID
  // In production, you'd have a dedicated endpoint
  const history = await getAnalysisHistory(undefined, 100, 0);
  const analysis = history.find((a) => a.id === analysisId);

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  // Return basic info - full analysis would need separate endpoint
  return {
    matchScore: analysis.matchScore,
    atsScore: analysis.atsScore,
    skillGaps: [],
    keywords: [],
    improvements: [],
  };
}

