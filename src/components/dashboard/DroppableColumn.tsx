import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useDragToScroll } from "@/hooks/useDragToScroll";

interface DroppableColumnProps {
  status: string;
  children: React.ReactNode;
}

export default function DroppableColumn({
  status,
  children,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const columnRef = useDragToScroll();

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        columnRef.current = el;
      }}
      className="min-w-[320px] w-80 flex-shrink-0 flex flex-col"
    >
      {children}
    </div>
  );
}
