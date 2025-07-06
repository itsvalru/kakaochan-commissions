import React from "react";
import { motion } from "framer-motion";
import type { StepKey } from "@/lib/stepEngine";

// Step information for tooltips
const stepInfo: Record<StepKey, { title: string; description: string }> = {
  path: {
    title: "Path Selection",
    description: "Choose commission category and type",
  },
  "comm-specific": {
    title: "Commission Details",
    description: "Configure specific requirements",
  },
  addons: { title: "Add-ons", description: "Select additional features" },
  usage: {
    title: "Usage Rights",
    description: "Choose how you will use the commission",
  },
  streaming: {
    title: "Streaming Permission",
    description: "Allow streaming showcase",
  },
  references: { title: "References", description: "Upload reference images" },
  "extra-info": {
    title: "Extra Information",
    description: "Additional details and notes",
  },
  summary: { title: "Summary", description: "Review and submit commission" },
};

interface FormProgressProps {
  formSteps: StepKey[];
  currentFormStep: number;
}

export default function FormProgress({
  formSteps,
  currentFormStep,
}: FormProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="form-card"
    >
      {/* Progress Bar with Checkpoints */}
      <div className="relative">
        {/* Progress Bar positioned at circles level */}
        <div className="absolute top-3 left-0 right-0 h-2 bg-[var(--bg-tertiary)] rounded-full">
          <motion.div
            className="bg-gradient-to-r from-[var(--red-primary)] to-[var(--red-secondary)] h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((currentFormStep - 1) / (formSteps.length - 1)) * 100
              }%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Checkpoint Indicators positioned on top */}
        <div className="relative flex justify-between">
          {formSteps.map((step, index) => {
            const isCompleted = index < currentFormStep - 1;
            const isCurrent = index === currentFormStep - 1;

            return (
              <div key={step} className="relative group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-[var(--red-primary)] text-white"
                      : isCurrent
                      ? "bg-[var(--red-primary)] text-white ring-2 ring-[var(--red-primary)] ring-opacity-50"
                      : "bg-[var(--bg-tertiary)] border-2 border-[var(--red-tertiary)] text-[var(--red-muted)]"
                  }`}
                >
                  {/* Icon placeholder - will be replaced later */}
                  <span className="text-sm font-bold">
                    {isCompleted ? "✓" : index + 1}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0a0000] border border-[#7f1d1d] rounded-lg text-sm text-[#fecaca] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="font-semibold">{stepInfo[step].title}</div>
                  <div className="text-[#9ca3af] text-xs">
                    {stepInfo[step].description}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0a0000]"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
