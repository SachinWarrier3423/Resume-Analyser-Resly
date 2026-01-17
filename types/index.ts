// Core types for the application
// Note: These types are used by the frontend
// Backend uses Zod schemas in lib/validation.ts

export interface AnalysisResult {
  id?: string;
  resumeId?: string;
  jobDescription?: string;
  matchScore: number;
  atsScore: number;
  skillGaps: SkillGap[];
  keywords: KeywordMatch[];
  improvements: Improvement[];
  createdAt?: string;
}

export interface SkillGap {
  skill: string;
  required: boolean;
  present: boolean;
  importance: number;
}

export interface KeywordMatch {
  keyword: string;
  count: number;
  category: "technical" | "soft" | "industry";
  matched: boolean;
}

export interface Improvement {
  category: "skills" | "experience" | "keywords" | "formatting";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionable: string;
}

export interface SavedAnalysis {
  id: string;
  jobTitle: string;
  company?: string;
  matchScore: number;
  atsScore: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  preferences: {
    aiModel: "standard" | "advanced";
    exportFormat: "pdf" | "docx" | "json";
    notifications: boolean;
  };
}

