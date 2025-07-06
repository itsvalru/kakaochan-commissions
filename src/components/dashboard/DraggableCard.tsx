import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Commission } from "@/lib/types/types";
import KanbanCard from "./KanbanCard";

interface DraggableCardProps {
  commission: Commission & { display_name?: string };
  activeId?: string;
}

export default function DraggableCard({
  commission,
  activeId,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: commission.id });

  if (isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      data-draggable="true"
      style={{
        transform: CSS.Translate.toString(transform),
      }}
    >
      <KanbanCard
        commission={commission}
        attributes={attributes}
        listeners={listeners}
        isDragging={activeId === commission.id}
      />
    </div>
  );
}
