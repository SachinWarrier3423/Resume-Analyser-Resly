"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import GlassCard from "@/components/GlassCard";
import ProgressTimeline from "@/components/ProgressTimeline";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { analyzeResumeStream } from "@/lib/api-client";
import { saveCurrentAnalysis, getCurrentAnalysis } from "@/lib/storage";

const tips = [
  "Parsing your resume structure...",
  "Extracting skills and experience...",
  "Matching against job requirements...",
  "Calculating ATS compatibility...",
  "Generating improvement recommendations...",
];

const steps = [
  { id: "parse", label: "Parsing resume", status: "pending" as const },
  { id: "extract", label: "Extracting content", status: "pending" as const },
  { id: "match", label: "Matching requirements", status: "pending" as const },
  { id: "analyze", label: "Analyzing gaps", status: "pending" as const },
  { id: "generate", label: "Generating insights", status: "pending" as const },
];

function ProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileRef = useRef<File | null>(null);
  const jobDescRef = useRef<string>("");

  useEffect(() => {
    // Get file and job description from sessionStorage
    const stored = getCurrentAnalysis();
    if (!stored) {
      router.push("/analyze");
      return;
    }

    // Reconstruct file from base64 if stored
    let resumeFile: File | null = null;
    if (stored.fileBase64 && stored.fileName) {
      try {
        const byteCharacters = atob(stored.fileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        resumeFile = new File([byteArray], stored.fileName, {
          type: "application/pdf",
        });
      } catch (e) {
        console.error("Failed to reconstruct file:", e);
        router.push("/analyze");
        return;
      }
    }

    if (!resumeFile || !stored.jobDescription) {
      router.push("/analyze");
      return;
    }

    fileRef.current = resumeFile;
    jobDescRef.current = stored.jobDescription;

    // Start analysis
    startAnalysis(resumeFile, stored.jobDescription);
  }, [router]);

  const startAnalysis = async (file: File, jobDescription: string) => {
    try {
      setError(null);
      setProgress(5);
      setCurrentStep(0);

      // Update steps as we progress
      const stepIntervals = [10, 30, 50, 70, 90];
      let stepIndex = 0;

      // Start streaming analysis
      let finalResult: any = null;
      
      for await (const partialResult of analyzeResumeStream(file, jobDescription)) {
        // Update progress based on received data
        if (partialResult.matchScore !== undefined) {
          const newProgress = Math.min(
            20 + (partialResult.matchScore || 0) * 0.6,
            90
          );
          setProgress(newProgress);

          // Update step based on what data we have
          if (partialResult.matchScore !== undefined && stepIndex < 2) {
            stepIndex = 2; // Match step
            setCurrentStep(stepIndex);
          }
          // Check for skill gaps (legacy format) or missing_skills (new format)
          if (
            (partialResult.skillGaps || (partialResult as any).missing_skills) &&
            stepIndex < 3
          ) {
            stepIndex = 3; // Analyze step
            setCurrentStep(stepIndex);
          }
          if (partialResult.improvements && stepIndex < 4) {
            stepIndex = 4; // Generate step
            setCurrentStep(stepIndex);
          }
        }

        // Store result in state for UI updates
        setAnalysisResult(partialResult);
        // Also keep a local reference for navigation
        finalResult = partialResult;
      }

      // Complete
      setProgress(100);
      setCurrentStep(4);

      // Save result and navigate using the final result from loop
      if (finalResult && (finalResult.matchScore !== undefined || finalResult.match_score !== undefined)) {
        saveCurrentAnalysis({
          ...finalResult,
          jobDescription: jobDescRef.current,
        });
        setTimeout(() => {
          router.push("/results");
        }, 1000);
      } else {
        // If we didn't get a valid result, show error
        throw new Error("Analysis completed but no valid result received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setProgress(0);
    }
  };

  // Rotate tips
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [error]);

  // Update step based on progress
  useEffect(() => {
    if (error || progress === 0) return;
    const stepThresholds = [10, 30, 50, 70, 90];
    const newStep = stepThresholds.findIndex((threshold) => progress < threshold);
    if (newStep !== -1 && newStep !== currentStep) {
      setCurrentStep(Math.max(0, newStep - 1));
    } else if (progress >= 90 && currentStep < 4) {
      setCurrentStep(4);
    }
  }, [progress, error, currentStep]);

  if (error) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-8">
          <GlassCard>
            <div className="text-center space-y-4 py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-2">
                  Analysis Failed
                </h2>
                <p className="text-sm text-neutral-600">{error}</p>
              </div>
              <button
                onClick={() => router.push("/analyze")}
                className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4"
          >
            <Sparkles className="w-8 h-8 text-accent-600" />
          </motion.div>
          <h1 className="text-4xl font-light text-neutral-900">
            Analyzing your resume
          </h1>
          <p className="text-neutral-600 font-light">
            This will only take a moment...
          </p>
        </div>

        <GlassCard>
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 font-light">Progress</span>
                <span className="text-neutral-900 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <ProgressTimeline
                steps={steps.map((step, index) => ({
                  ...step,
                  status:
                    index < currentStep
                      ? "completed"
                      : index === currentStep
                      ? "active"
                      : "pending",
                }))}
              />
            </div>

            {/* Rotating Tips */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-6 border-t border-neutral-200"
              >
                <p className="text-sm text-neutral-600 font-light">
                  {tips[currentTip]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center py-12">
            <p className="text-neutral-600 font-light">Loading...</p>
          </div>
        </div>
      </AppShell>
    }>
      <ProgressContent />
    </Suspense>
  );
}
