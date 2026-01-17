"use client";

import { motion } from "framer-motion";
import { Improvement } from "@/types";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface InsightListProps {
  improvements: Improvement[];
}

export default function InsightList({ improvements }: InsightListProps) {
  const getIcon = (priority: Improvement["priority"]) => {
    switch (priority) {
      case "high":
        return AlertCircle;
      case "medium":
        return Info;
      case "low":
        return CheckCircle;
    }
  };

  const getColor = (priority: Improvement["priority"]) => {
    switch (priority) {
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-accent-500";
    }
  };

  return (
    <div className="space-y-4">
      {improvements.map((improvement, index) => {
        const Icon = getIcon(improvement.priority);
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-lg p-4 border border-neutral-200/50"
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${getColor(improvement.priority)} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {improvement.title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {improvement.description}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-md p-3 border border-neutral-200/50">
                  <p className="text-xs font-medium text-neutral-700 mb-1">
                    Actionable:
                  </p>
                  <p className="text-xs text-neutral-600">{improvement.actionable}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

