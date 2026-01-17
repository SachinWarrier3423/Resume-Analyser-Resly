"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import GlassCard from "@/components/GlassCard";
import RadialScore from "@/components/RadialScore";
import AnimatedButton from "@/components/AnimatedButton";
import { motion } from "framer-motion";
import { Calendar, Building2, ExternalLink, Trash2, AlertCircle } from "lucide-react";
import { SavedAnalysis } from "@/types";
import Link from "next/link";
import { getAnalysisHistory } from "@/lib/api-client";

export default function HistoryPage() {
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalysisHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      // For now, show empty state if API fails (user might not be authenticated)
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-neutral-900 mb-2">
              Analysis History
            </h1>
            <p className="text-neutral-600 font-light">
              View and compare your past analyses
            </p>
          </div>
          <Link href="/analyze">
            <AnimatedButton>New Analysis</AnimatedButton>
          </Link>
        </div>

        {loading ? (
          <GlassCard>
            <div className="text-center py-16">
              <p className="text-neutral-600 font-light">Loading history...</p>
            </div>
          </GlassCard>
        ) : error ? (
          <GlassCard>
            <div className="text-center py-16 space-y-4">
              <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto" />
              <div>
                <p className="text-sm text-neutral-600 mb-4">{error}</p>
                <AnimatedButton onClick={loadHistory} size="sm">
                  Retry
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        ) : history.length === 0 ? (
          <GlassCard>
            <div className="text-center py-16 space-y-4">
              <p className="text-neutral-600 font-light">
                No analyses yet. Start your first analysis to see results here.
              </p>
              <Link href="/analyze">
                <AnimatedButton>Analyze Resume</AnimatedButton>
              </Link>
            </div>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="h-full flex flex-col">
                  <div className="flex-1 space-y-6">
                    {/* Header */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-1">
                        {analysis.jobTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Building2 className="w-4 h-4" />
                        <span className="font-light">{analysis.company}</span>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <RadialScore
                          score={analysis.matchScore}
                          label="Match"
                          size={80}
                          strokeWidth={6}
                        />
                      </div>
                      <div className="text-center">
                        <RadialScore
                          score={analysis.atsScore}
                          label="ATS"
                          size={80}
                          strokeWidth={6}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-neutral-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(analysis.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/results?id=${analysis.id}`}
                          className="flex-1"
                        >
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            className="w-full"
                          >
                            View Details
                            <ExternalLink className="w-3.5 h-3.5 ml-2" />
                          </AnimatedButton>
                        </Link>
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-500" />
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

