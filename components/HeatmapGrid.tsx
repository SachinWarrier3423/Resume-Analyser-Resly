"use client";

import { motion } from "framer-motion";
import { KeywordMatch } from "@/types";

interface HeatmapGridProps {
  keywords: KeywordMatch[];
  maxCount?: number;
}

export default function HeatmapGrid({
  keywords,
  maxCount,
}: HeatmapGridProps) {
  const max = maxCount || Math.max(...keywords.map((k) => k.count), 1);

  const getIntensity = (count: number) => {
    const ratio = count / max;
    if (ratio >= 0.8) return "bg-accent-500";
    if (ratio >= 0.6) return "bg-accent-400";
    if (ratio >= 0.4) return "bg-accent-300";
    if (ratio >= 0.2) return "bg-accent-200";
    return "bg-accent-100";
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {keywords.map((keyword, index) => (
        <motion.div
          key={keyword.keyword}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
          className={`${getIntensity(keyword.count)} rounded-md p-2 text-center border border-white/20`}
          title={`${keyword.keyword}: ${keyword.count} occurrences`}
        >
          <p className="text-[10px] font-light text-white truncate">
            {keyword.keyword}
          </p>
          <p className="text-[8px] text-white/80 mt-0.5">{keyword.count}</p>
        </motion.div>
      ))}
    </div>
  );
}

