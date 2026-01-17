"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import GlassCard from "@/components/GlassCard";
import UploadZone from "@/components/UploadZone";
import AnimatedButton from "@/components/AnimatedButton";
import { FileText, AlertCircle } from "lucide-react";
import { saveCurrentAnalysis } from "@/lib/storage";

export default function AnalyzerPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<{
    resume?: string;
    jobDescription?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!resumeFile) {
      newErrors.resume = "Please upload your resume";
    }
    if (!jobDescription.trim()) {
      newErrors.jobDescription = "Please enter a job description";
    } else if (jobDescription.trim().length < 50) {
      newErrors.jobDescription =
        "Job description must be at least 50 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate() || !resumeFile) return;

    setIsAnalyzing(true);
    setErrors({});

    try {
      // Convert file to base64 for temporary storage
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:application/pdf;base64, prefix
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(resumeFile!);
      });

      // Save file and job description for progress page
      saveCurrentAnalysis({
        jobDescription,
        fileName: resumeFile.name,
        fileBase64,
      });

      // Navigate to progress page which will handle the API call
      router.push("/analyze/progress");
    } catch (error) {
      setIsAnalyzing(false);
      setErrors({
        general: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light text-neutral-900">
            Analyze your resume
          </h1>
          <p className="text-neutral-600 font-light">
            Upload your resume and paste the job description to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <GlassCard>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-600" />
                <h2 className="text-lg font-medium text-neutral-900">
                  Your Resume
                </h2>
              </div>
              <UploadZone
                onFileSelect={(file) => {
                  setResumeFile(file);
                  setErrors((prev) => ({ ...prev, resume: undefined }));
                }}
              />
              {errors.resume && (
                <p className="text-sm text-red-500">{errors.resume}</p>
              )}
            </div>
          </GlassCard>

          {/* Job Description */}
          <GlassCard>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-600" />
                <h2 className="text-lg font-medium text-neutral-900">
                  Job Description
                </h2>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    jobDescription: undefined,
                  }));
                }}
                placeholder="Paste the job description here..."
                className={`w-full h-64 px-4 py-3 rounded-lg border ${
                  errors.jobDescription
                    ? "border-red-300"
                    : "border-neutral-200"
                } bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm font-light text-neutral-900 placeholder:text-neutral-400 resize-none transition-all`}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription}
                </p>
              )}
              <p className="text-xs text-neutral-500">
                {jobDescription.length} characters
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{errors.general}</p>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-center">
          <AnimatedButton
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
            className="min-w-[200px]"
          >
            {isAnalyzing ? "Starting analysis..." : "Analyze Resume"}
          </AnimatedButton>
        </div>
      </div>
    </AppShell>
  );
}

