"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import GlassCard from "@/components/GlassCard";
import RadialScore from "@/components/RadialScore";
import SkillChip from "@/components/SkillChip";
import HeatmapGrid from "@/components/HeatmapGrid";
import InsightList from "@/components/InsightList";
import AnimatedButton from "@/components/AnimatedButton";
import { motion } from "framer-motion";
import { Download, Share2, TrendingUp, AlertCircle } from "lucide-react";
import { AnalysisResult } from "@/types";
import { getCurrentAnalysis, clearCurrentAnalysis } from "@/lib/storage";
import { toLegacyFormat } from "@/lib/schema-adapter";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentAnalysis();
    if (!stored || !stored.matchScore) {
      // No results found, redirect to analyze
      router.push("/analyze");
      return;
    }

    // Convert to legacy format if needed
    if (stored.match_score !== undefined) {
      // New format - convert
      const legacy = toLegacyFormat(stored as any);
      setResults({
        ...legacy,
        jobDescription: stored.jobDescription,
        createdAt: stored.savedAt || new Date().toISOString(),
      });
    } else {
      // Already in legacy format
      setResults({
        ...stored,
        jobDescription: stored.jobDescription,
        createdAt: stored.savedAt || new Date().toISOString(),
      });
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center py-12">
            <p className="text-neutral-600 font-light">Loading results...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!results) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto space-y-8">
          <GlassCard>
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto" />
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-2">
                  No Results Found
                </h2>
                <p className="text-sm text-neutral-600 mb-4">
                  Please analyze a resume first.
                </p>
                <AnimatedButton onClick={() => router.push("/analyze")}>
                  Analyze Resume
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  const matchedSkills = results.skillGaps.filter((s) => s.present);
  const missingSkills = results.skillGaps.filter((s) => !s.present && s.required);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-neutral-900 mb-2">
              Analysis Results
            </h1>
            <p className="text-neutral-600 font-light">
              Your resume analysis is complete
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AnimatedButton variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </AnimatedButton>
            <AnimatedButton variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </AnimatedButton>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <div className="flex items-center justify-center py-8">
              <RadialScore
                score={results.matchScore}
                label="Match Score"
                size={140}
              />
            </div>
            <div className="text-center space-y-2 pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 font-light">
                How well your resume matches the job description
              </p>
              {results.matchScore >= 80 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-accent-100 rounded-full"
                >
                  <TrendingUp className="w-4 h-4 text-accent-600" />
                  <span className="text-xs font-medium text-accent-700">
                    Excellent match!
                  </span>
                </motion.div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-center py-8">
              <RadialScore
                score={results.atsScore}
                label="ATS Score"
                size={140}
              />
            </div>
            <div className="text-center space-y-2 pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 font-light">
                Applicant Tracking System compatibility
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Skills Analysis */}
        <GlassCard>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium text-neutral-900 mb-1">
                Skills Analysis
              </h2>
              <p className="text-sm text-neutral-600 font-light">
                Skills found in your resume vs. job requirements
              </p>
            </div>

            {matchedSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-700 mb-3">
                  Matched Skills ({matchedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill) => (
                    <SkillChip
                      key={skill.skill}
                      skill={skill.skill}
                      matched={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {missingSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-700 mb-3">
                  Missing Required Skills ({missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <SkillChip
                      key={skill.skill}
                      skill={skill.skill}
                      matched={false}
                      importance={skill.importance}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Keyword Heatmap */}
        <GlassCard>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium text-neutral-900 mb-1">
                Keyword Analysis
              </h2>
              <p className="text-sm text-neutral-600 font-light">
                Frequency of important keywords in your resume
              </p>
            </div>
            <HeatmapGrid keywords={results.keywords} />
          </div>
        </GlassCard>

        {/* Improvement Roadmap */}
        <GlassCard>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium text-neutral-900 mb-1">
                Improvement Roadmap
              </h2>
              <p className="text-sm text-neutral-600 font-light">
                Prioritized recommendations to enhance your resume
              </p>
            </div>
            <InsightList improvements={results.improvements} />
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

