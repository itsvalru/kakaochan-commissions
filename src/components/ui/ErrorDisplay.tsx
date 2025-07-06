import React from "react";
import { motion } from "framer-motion";

interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  error,
  onDismiss,
  className = "",
}: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--red-primary)] border border-[var(--red-secondary)] text-white p-4 rounded-lg ${className}`}
    >
      <div className="flex items-center">
        <span className="mr-2">⚠️</span>
        {error}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto text-[var(--red-light)] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}
