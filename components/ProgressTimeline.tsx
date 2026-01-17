"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface TimelineStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
  currentStep?: string;
}

export default function ProgressTimeline({
  steps,
  currentStep,
}: ProgressTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
      <div className="space-y-8">
        {steps.map((step, index) => {
          const isActive = step.status === "active" || step.id === currentStep;
          const isCompleted = step.status === "completed";
          const isPending = step.status === "pending";

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4"
            >
              <motion.div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isCompleted
                    ? "bg-accent-500 border-accent-500"
                    : isActive
                    ? "bg-white border-accent-500"
                    : "bg-white border-neutral-300"
                }`}
                animate={
                  isActive && !isCompleted
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(14, 165, 233, 0.4)",
                          "0 0 0 8px rgba(14, 165, 233, 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: isActive && !isCompleted ? Infinity : 0,
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-accent-500" : "bg-transparent"
                    }`}
                  />
                )}
              </motion.div>

              <div className="flex-1 pt-1">
                <p
                  className={`text-sm font-medium ${
                    isActive || isCompleted
                      ? "text-neutral-900"
                      : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

