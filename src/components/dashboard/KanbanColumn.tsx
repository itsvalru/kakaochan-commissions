import React from "react";
import { motion } from "framer-motion";
import type { Commission } from "@/lib/types/types";
import DraggableCard from "./DraggableCard";

interface KanbanColumnProps {
  group: {
    key: string;
    label: string;
    color: string;
    items: (Commission & { display_name?: string })[];
  };
  isOver: boolean;
  filteredItems: (Commission & { display_name?: string })[];
  showGhost: boolean;
  showNoCommissions: boolean;
  ghostIndex: number;
  activeCard: (Commission & { display_name?: string }) | null;
  measureRef?: (el: HTMLDivElement | null) => void;
}

export default function KanbanColumn({
  group,
  isOver,
  filteredItems,
  showGhost,
  showNoCommissions,
  ghostIndex,
  activeCard,
  measureRef,
}: KanbanColumnProps) {
  return (
    <>
      <div className="w-full mb-4 flex items-center justify-center">
        <span
          className={`w-full text-center px-4 py-2 rounded-full font-semibold text-base ${group.color} shadow-sm`}
        >
          {group.label}
        </span>
      </div>
      <motion.div
        layout
        className={`bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-4 ${
          isOver
            ? "ring-2 ring-[var(--red-primary)] bg-[var(--bg-tertiary)]"
            : ""
        }`}
        style={{ minHeight: "48px" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.2,
        }}
      >
        {showNoCommissions ? (
          <motion.div
            layout
            className="rounded-xl text-center text-[var(--red-muted)] py-2 shadow-inner flex items-center justify-center"
            transition={{ duration: 0.2 }}
          >
            No commissions
          </motion.div>
        ) : (
          <motion.div
            layout
            className="space-y-4 h-full flex flex-col justify-center"
            transition={{ duration: 0.2 }}
          >
            {filteredItems.map((commission, idx) => (
              <React.Fragment key={commission.id}>
                {showGhost && ghostIndex === idx && (
                  <motion.div
                    layout
                    key="ghost"
                    className="rounded-xl bg-transparent border-2 border-dashed border-[var(--red-primary)] opacity-50 min-h-[88px]"
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
                <motion.div
                  layout
                  ref={idx === 0 ? measureRef : undefined}
                  transition={{ duration: 0.2 }}
                >
                  <DraggableCard
                    commission={commission}
                    activeId={activeCard?.id}
                  />
                </motion.div>
              </React.Fragment>
            ))}
            {/* If ghost goes at the end */}
            {showGhost && ghostIndex === filteredItems.length && (
              <motion.div
                layout
                key="ghost-end"
                className="rounded-xl bg-transparent border-2 border-dashed border-[var(--red-primary)] opacity-50 min-h-[88px]"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
