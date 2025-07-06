"use client";

import React, { useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { Commission } from "@/lib/types/types";
import KanbanCard from "./KanbanCard";
import DroppableColumn from "./DroppableColumn";
import KanbanColumn from "./KanbanColumn";
import { useKanbanDrag } from "@/hooks/useKanbanDrag";

interface CategoryBoardProps {
  category: string;
  commissions: (Commission & { display_name?: string })[];
  setCommissions: React.Dispatch<
    React.SetStateAction<(Commission & { display_name?: string })[]>
  >;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  sortBy?: "date" | "client" | "category" | "price";
  sortOrder?: "asc" | "desc";
}

// Helper function to get sort value for a commission
const getSortValue = (
  commission: Commission & { display_name?: string },
  sortBy: string
) => {
  switch (sortBy) {
    case "date":
      return new Date(commission.created_at).getTime();
    case "client":
      return commission.display_name || "";
    case "category":
      return `${commission.category_name} ${commission.type_name} ${
        commission.subtype_name || ""
      }`;
    case "price":
      return commission.total_price || 0;
    default:
      return 0;
  }
};

const STATUS_ORDER = [
  { key: "submitted", label: "Review", color: "bg-blue-100 text-blue-700" },
  { key: "waitlist", label: "Waitlist", color: "bg-teal-100 text-teal-700" },
  { key: "payment", label: "Payment", color: "bg-yellow-100 text-yellow-700" },
  { key: "wip", label: "WIP", color: "bg-purple-100 text-purple-700" },
  { key: "finished", label: "Finished", color: "bg-green-100 text-green-700" },
];

export default function CategoryBoard({
  category,
  commissions,
  setCommissions,
  setError,
  sortBy = "date",
  sortOrder = "desc",
}: CategoryBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<{ [col: string]: HTMLDivElement | null }>({});

  // Use custom hook for drag-and-drop logic - isolated to this board
  const {
    activeCard,
    overColumn,
    draggedFromColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDrag(commissions, setCommissions, setError);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const boardGrouped = STATUS_ORDER.map((status) => ({
    ...status,
    items: commissions.filter((c) => c.status === status.key),
  }));

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-[var(--red-light)] mb-4 px-8">
        {category}
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={boardRef}
          className="flex gap-6 px-8 overflow-x-auto pb-4 p-0.5 select-none custom-scroll-hide"
          style={{
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            cursor: "grab",
          }}
        >
          {boardGrouped.map((group) => {
            const isOver = overColumn === group.key;
            const isDraggingFromThisColumn = draggedFromColumn === group.key;
            const filteredItems = group.items.filter(
              (commission) =>
                !(
                  activeCard &&
                  commission.id === activeCard.id &&
                  isDraggingFromThisColumn
                )
            );
            const showGhost = !!activeCard && isOver;
            const isEmpty = filteredItems.length === 0;
            const showNoCommissions = isEmpty && !showGhost;

            // Improved predictive drop index calculation based on sorted items
            let ghostIndex = -1;
            if (showGhost && activeCard) {
              if (isDraggingFromThisColumn) {
                // When dragging within the same column, show ghost at current position
                // Use the original items array to find the position since the card is temporarily removed from filteredItems
                const currentIdx = group.items.findIndex(
                  (c) => c.id === activeCard.id
                );
                ghostIndex = currentIdx;
              } else {
                // When dragging from another column, calculate where it would be inserted in sorted order
                const activeCardValue = getSortValue(activeCard, sortBy);
                let insertIndex = 0;

                for (let i = 0; i < filteredItems.length; i++) {
                  const itemValue = getSortValue(filteredItems[i], sortBy);
                  const shouldInsertBefore =
                    sortOrder === "asc"
                      ? activeCardValue < itemValue
                      : activeCardValue > itemValue;

                  if (shouldInsertBefore) {
                    break;
                  }
                  insertIndex = i + 1;
                }

                ghostIndex = insertIndex;
              }
            }

            return (
              <DroppableColumn key={group.key} status={group.key}>
                <KanbanColumn
                  group={group}
                  isOver={isOver}
                  filteredItems={filteredItems}
                  showGhost={showGhost}
                  showNoCommissions={showNoCommissions}
                  ghostIndex={ghostIndex}
                  activeCard={activeCard}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  measureRef={(el) => {
                    measureRefs.current[group.key] = el;
                  }}
                />
              </DroppableColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeCard ? (
            <KanbanCard commission={activeCard} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
