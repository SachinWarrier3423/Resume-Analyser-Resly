/**
 * Schema adapter utilities
 * Converts between new deterministic schema and legacy frontend format
 */

import type { AnalysisResult } from "@/lib/validation";
import type { LegacyAnalysisResult } from "@/lib/validation";

/**
 * Convert new schema to legacy format for frontend compatibility
 */
export function toLegacyFormat(result: AnalysisResult): LegacyAnalysisResult {
  // Extract skills from missing_skills and keyword analysis
  const missingSkills = result.missing_skills || [];
  const presentKeywords = result.keyword_analysis?.present || [];
  const missingKeywords = result.keyword_analysis?.missing || [];

  // Build skill gaps (simplified - all missing skills are required and not present)
  const skillGaps = missingSkills.map((skill) => ({
    skill,
    required: true,
    present: false,
    importance: 0.7, // Default importance
  }));

  // Build keywords array
  const keywords = [
    ...presentKeywords.map((keyword) => ({
      keyword,
      count: 1, // Simplified - would need actual count from resume
      category: "technical" as const, // Simplified categorization
      matched: true,
    })),
    ...missingKeywords.map((keyword) => ({
      keyword,
      count: 0,
      category: "technical" as const,
      matched: false,
    })),
  ];

  // Build improvements array from improvements strings
  const improvements = result.improvements.map((improvement, index) => {
    // Parse improvement string to extract category and priority
    // This is a simplified parser - in production, you might want more structure
    const isHighPriority = improvement.toLowerCase().includes("critical") || 
                           improvement.toLowerCase().includes("important") ||
                           index < 2; // First 2 are high priority
    
    return {
      category: improvement.toLowerCase().includes("skill") ? "skills" as const :
                improvement.toLowerCase().includes("keyword") ? "keywords" as const :
                improvement.toLowerCase().includes("format") ? "formatting" as const :
                "experience" as const,
      priority: isHighPriority ? "high" as const : 
                index < 4 ? "medium" as const : 
                "low" as const,
      title: improvement.substring(0, 50) || "Improvement",
      description: improvement,
      actionable: improvement,
    };
  });

  return {
    matchScore: result.match_score,
    atsScore: result.ats_score,
    skillGaps,
    keywords,
    improvements,
  };
}

/**
 * Validate schema robustness - check for common issues
 */
export function validateSchemaRobustness(result: AnalysisResult): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check scores are reasonable
  if (result.match_score < 0 || result.match_score > 100) {
    issues.push("match_score out of range");
  }
  if (result.ats_score < 0 || result.ats_score > 100) {
    issues.push("ats_score out of range");
  }

  // Check arrays are not null/undefined
  if (!Array.isArray(result.missing_skills)) {
    issues.push("missing_skills is not an array");
  }
  if (!Array.isArray(result.resume_strengths)) {
    issues.push("resume_strengths is not an array");
  }
  if (!Array.isArray(result.improvements)) {
    issues.push("improvements is not an array");
  }

  // Check keyword_analysis structure
  if (!result.keyword_analysis || typeof result.keyword_analysis !== "object") {
    issues.push("keyword_analysis is not an object");
  } else {
    if (!Array.isArray(result.keyword_analysis.present)) {
      issues.push("keyword_analysis.present is not an array");
    }
    if (!Array.isArray(result.keyword_analysis.missing)) {
      issues.push("keyword_analysis.missing is not an array");
    }
  }

  // Check summary length
  if (!result.role_fit_summary || result.role_fit_summary.length < 50) {
    issues.push("role_fit_summary too short (min 50 chars)");
  }
  if (result.role_fit_summary.length > 500) {
    issues.push("role_fit_summary too long (max 500 chars)");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

