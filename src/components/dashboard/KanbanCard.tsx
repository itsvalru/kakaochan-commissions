import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import type { Commission } from "@/lib/types/types";
import type { DraggableAttributes } from "@dnd-kit/core";
import CommissionDetailPopup from "./CommissionDetailPopup";

interface KanbanCardProps {
  commission: Commission & { display_name?: string };
  listeners?: Record<string, (event: MouseEvent | TouchEvent) => void>;
  attributes?: DraggableAttributes;
  isDragging?: boolean;
}

function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function KanbanCard({
  commission,
  listeners,
  attributes,
  isDragging,
}: KanbanCardProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopup(true);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/commissions/${commission.id}`, "_blank");
  };

  return (
    <>
      <div
        {...attributes}
        {...listeners}
        className={`bg-[var(--bg-tertiary)] rounded-xl shadow-lg p-4 flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
          isDragging
            ? "ring-2 ring-[var(--red-primary)] scale-105"
            : "hover:scale-[1.02]"
        }`}
        onClick={handleCardClick}
        style={{ zIndex: isDragging ? 50 : undefined }}
      >
        <div className="font-semibold text-[var(--red-light)] truncate">
          {commission.category_name} - {commission.type_name}
          {commission.subtype_name && ` (${commission.subtype_name})`}
        </div>
        <div className="flex items-center gap-2 text-[var(--red-muted)] text-sm">
          <span className="font-medium text-[var(--red-light)]">
            {commission.display_name || "Unknown"}
          </span>
          <span>•</span>
          <span>{formatDate(commission.created_at)}</span>
          <button
            onClick={handleChatClick}
            className="ml-auto p-2 text-[var(--red-light)] rounded-full transition-all duration-200 group relative hover:bg-[var(--bg-secondary)]"
            title="Open chat"
          >
            <FaComments className="relative z-10 transition-transform duration-200 group-hover:scale-110" />
          </button>
        </div>
      </div>

      <CommissionDetailPopup
        commission={commission}
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onChat={() => {
          setShowPopup(false);
          window.open(`/commissions/${commission.id}`, "_blank");
        }}
      />
    </>
  );
}
