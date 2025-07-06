import { useState } from "react";
import type { Commission } from "@/lib/types/types";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { updateCommission } from "@/lib/supabase-client";

const STATUS_ORDER = [
  { key: "submitted", label: "Review", color: "bg-blue-100 text-blue-700" },
  { key: "waitlist", label: "Waitlist", color: "bg-teal-100 text-teal-700" },
  { key: "payment", label: "Payment", color: "bg-yellow-100 text-yellow-700" },
  { key: "wip", label: "WIP", color: "bg-purple-100 text-purple-700" },
  { key: "finished", label: "Finished", color: "bg-green-100 text-green-700" },
];

// Helper to get the predicted drop index with types
function getDropIndex(
  items: (Commission & { display_name?: string })[],
  activeId: string,
  overId: string | null
): number {
  if (!overId) return items.length;
  // If overId is a card, insert before that card
  const overIndex = items.findIndex((c) => c.id === overId);
  if (overIndex !== -1) return overIndex;
  // If overId is the column itself, insert at the end
  return items.length;
}

export function useKanbanDrag(
  commissions: (Commission & { display_name?: string })[],
  setCommissions: React.Dispatch<
    React.SetStateAction<(Commission & { display_name?: string })[]>
  >,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [activeCard, setActiveCard] = useState<
    (Commission & { display_name?: string }) | null
  >(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(
    null
  );
  const [dropIndex, setDropIndex] = useState<{ [col: string]: number }>({});

  // Group commissions by status
  const grouped = STATUS_ORDER.map((status) => ({
    ...status,
    items: commissions.filter((c) => c.status === status.key),
  }));

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const found = commissions.find((c) => c.id === active.id);
    setActiveCard(found || null);
    // Track which column the card is being dragged from
    if (found) {
      setDraggedFromColumn(found.status);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (over && STATUS_ORDER.some((col) => col.key === over.id)) {
      setOverColumn(over.id as string);
      // Predict drop index for the target column
      const targetCol = over.id as string;
      const items = grouped.find((g) => g.key === targetCol)?.items || [];
      // dnd-kit UniqueIdentifier can be string | number, but our ids are string
      const overId = typeof over.id === "string" ? over.id : String(over.id);
      const activeId =
        typeof active.id === "string" ? active.id : String(active.id);
      const index = getDropIndex(items, activeId, overId);
      setDropIndex((prev) => ({ ...prev, [targetCol]: index }));
    } else {
      setOverColumn(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setOverColumn(null);
    setDraggedFromColumn(null);
    if (!over || !active) return;
    const cardId = active.id as string;
    const destCol = over.id as string;
    const sourceCol = commissions.find((c) => c.id === cardId)?.status;
    if (!destCol || sourceCol === destCol) {
      setActiveCard(null);
      return;
    }
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, status: destCol as Commission["status"] } : c
      )
    );
    updateCommission(cardId, { status: destCol as Commission["status"] }).catch(
      () => setError("Failed to update status")
    );
    setActiveCard(null);
  }

  function handleDragCancel() {
    setActiveCard(null);
    setOverColumn(null);
    setDraggedFromColumn(null);
  }

  return {
    activeCard,
    overColumn,
    draggedFromColumn,
    dropIndex,
    grouped,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
