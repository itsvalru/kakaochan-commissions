"use client";

import React, { useEffect, useState, useRef } from "react";
import { getUserCommissions, isUserAdmin } from "@/lib/supabase-client";
import type { Commission } from "@/lib/types/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

// Import new components and hooks
import AdminSidebar from "./AdminSidebar";
import KanbanCard from "./KanbanCard";
import DroppableColumn from "./DroppableColumn";
import KanbanColumn from "./KanbanColumn";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { useKanbanDrag } from "@/hooks/useKanbanDrag";

export function AdminDashboard() {
  const [commissions, setCommissions] = useState<
    (Commission & { display_name?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<{ [col: string]: HTMLDivElement | null }>({});

  // Use custom hook for drag-and-drop logic
  const {
    activeCard,
    overColumn,
    draggedFromColumn,
    dropIndex,
    grouped,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDrag(commissions, setCommissions, setError);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminCheck = await isUserAdmin();
        setIsAdmin(adminCheck);
        if (!adminCheck) {
          setError("Access denied. Admin privileges required.");
          return;
        }
        const data = await getUserCommissions();
        setCommissions(data);
      } catch {
        setError("Failed to load commissions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Measure card height for each column
  useEffect(() => {
    const newHeights: { [col: string]: number } = {};
    Object.entries(measureRefs.current).forEach(([col, ref]) => {
      if (ref) {
        newHeights[col] = ref.getBoundingClientRect().height;
      }
    });
  }, [commissions]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Force the drag-to-scroll effect to run on mount by updating activeCard
  useEffect(() => {
    // This effect is no longer needed as activeCard is managed by the hook
  }, []);

  if (loading) {
    return (
      <div className="ml-56 p-8">
        <LoadingSpinner message="Loading commissions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-56 p-8">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-[#dc2626]">
            Access denied. Admin privileges required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 w-[calc(100vw-224px)] min-h-screen bg-[var(--bg-primary)] py-8">
        <h2 className="text-3xl font-bold text-[var(--red-light)] mb-8 px-8">
          Commissions
        </h2>
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
            {grouped.map((group) => {
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

              // Improved predictive drop index calculation
              let ghostIndex = -1;
              if (showGhost && activeCard) {
                if (isDraggingFromThisColumn) {
                  // When dragging within the same column, show ghost at current position
                  const currentIdx = group.items.findIndex(
                    (c) => c.id === activeCard.id
                  );
                  ghostIndex = currentIdx;
                } else {
                  // When dragging from another column, use the predicted index
                  ghostIndex = dropIndex[group.key] ?? filteredItems.length;
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
      </main>
    </div>
  );
}
