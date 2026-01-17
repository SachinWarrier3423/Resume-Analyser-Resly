"use client";

import { motion } from "framer-motion";

interface SkillChipProps {
  skill: string;
  matched?: boolean;
  importance?: number;
  onClick?: () => void;
}

export default function SkillChip({
  skill,
  matched = true,
  importance = 1,
  onClick,
}: SkillChipProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-light transition-all ${
        matched
          ? "bg-accent-100 text-accent-700 border border-accent-200"
          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
      }`}
    >
      {skill}
      {!matched && (
        <span className="ml-1.5 text-[10px] text-neutral-400">
          missing
        </span>
      )}
    </Component>
  );
}

