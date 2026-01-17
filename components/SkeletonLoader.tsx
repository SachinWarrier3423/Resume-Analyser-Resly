"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export default function SkeletonLoader({
  className = "",
  count = 1,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`bg-neutral-200 rounded-lg ${className}`}
        >
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-full w-full bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] rounded-lg"
          />
        </motion.div>
      ))}
    </>
  );
}

