import { z } from "zod";

// File size limits (5MB max)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ALLOWED_FILE_TYPES = ["application/pdf"];

// Analysis request schema
export const AnalyzeRequestSchema = z.object({
  resumeText: z.string().min(100, "Resume text must be at least 100 characters"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  userId: z.string().uuid().optional(), // Optional for anonymous usage
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// AI Analysis result schema (validated output from Groq)
// Strict, deterministic schema for production-safe inference
export const AnalysisResultSchema = z.object({
  match_score: z.number().int().min(0).max(100),
  missing_skills: z.array(z.string()).min(0),
  ats_score: z.number().int().min(0).max(100),
  keyword_analysis: z.object({
    present: z.array(z.string()).min(0),
    missing: z.array(z.string()).min(0),
  }),
  resume_strengths: z.array(z.string()).min(0),
  improvements: z.array(z.string()).min(0),
  role_fit_summary: z.string().min(50).max(500),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// Legacy schema for backward compatibility (maps to new schema)
export interface LegacyAnalysisResult {
  matchScore: number;
  atsScore: number;
  skillGaps: Array<{
    skill: string;
    required: boolean;
    present: boolean;
    importance: number;
  }>;
  keywords: Array<{
    keyword: string;
    count: number;
    category: "technical" | "soft" | "industry";
    matched: boolean;
  }>;
  improvements: Array<{
    category: "skills" | "experience" | "keywords" | "formatting";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    actionable: string;
  }>;
}

// History response schema
export const HistoryResponseSchema = z.array(
  z.object({
    id: z.string().uuid(),
    jobTitle: z.string(),
    company: z.string().optional(),
    matchScore: z.number().int().min(0).max(100),
    atsScore: z.number().int().min(0).max(100),
    createdAt: z.string().datetime(),
  })
);

export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

