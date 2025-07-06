"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
import CategoryBoard from "./CategoryBoard";

// Filter and sort types
type SortOption = "date" | "client" | "category" | "price";
type FilterOption =
  | "all"
  | "draft"
  | "submitted"
  | "waitlist"
  | "payment"
  | "wip"
  | "finished";

export function AdminDashboard() {
  const [commissions, setCommissions] = useState<
    (Commission & { display_name?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<{ [col: string]: HTMLDivElement | null }>({});

  // New state for filtering, sorting, and view toggle
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"unified" | "categories">("unified");

  // Helper function to get sort value for a commission
  const getSortValue = (
    commission: Commission & { display_name?: string },
    sortBy: SortOption
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

  // Use custom hook for drag-and-drop logic
  const {
    activeCard,
    overColumn,
    draggedFromColumn,
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

  // Filter and sort commissions
  const filteredAndSortedCommissions = useMemo(() => {
    let filtered = commissions;

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(
        (commission) => commission.status === filterBy
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (commission) =>
          commission.category_name.toLowerCase().includes(query) ||
          commission.type_name.toLowerCase().includes(query) ||
          commission.subtype_name?.toLowerCase().includes(query) ||
          commission.display_name?.toLowerCase().includes(query) ||
          commission.id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "client":
          aValue = a.display_name || "";
          bValue = b.display_name || "";
          break;
        case "category":
          aValue = `${a.category_name} ${a.type_name} ${a.subtype_name || ""}`;
          bValue = `${b.category_name} ${b.type_name} ${b.subtype_name || ""}`;
          break;
        case "price":
          aValue = a.total_price || 0;
          bValue = b.total_price || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [commissions, filterBy, searchQuery, sortBy, sortOrder]);

  // Group commissions by category for category view
  const categoryGroups = useMemo(() => {
    const categories = new Map<
      string,
      (Commission & { display_name?: string })[]
    >();

    filteredAndSortedCommissions.forEach((commission) => {
      const category = commission.category_name;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(commission);
    });

    return Array.from(categories.entries()).map(([category, commissions]) => ({
      category,
      commissions,
    }));
  }, [filteredAndSortedCommissions]);

  // Define status order for kanban boards
  const STATUS_ORDER = [
    { key: "submitted", label: "Review", color: "bg-blue-100 text-blue-700" },
    {
      key: "waitlist",
      label: "Waitlist",
      color: "bg-teal-100 text-teal-700",
    },
    {
      key: "payment",
      label: "Payment",
      color: "bg-yellow-100 text-yellow-700",
    },
    { key: "wip", label: "WIP", color: "bg-purple-100 text-purple-700" },
    {
      key: "finished",
      label: "Finished",
      color: "bg-green-100 text-green-700",
    },
  ];

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

  const renderKanbanBoard = (
    commissions: (Commission & { display_name?: string })[],
    title?: string
  ) => {
    const boardGrouped = STATUS_ORDER.map((status) => ({
      ...status,
      items: commissions.filter((c) => c.status === status.key),
    }));

    return (
      <div className="mb-8">
        {title && (
          <h3 className="text-xl font-semibold text-[var(--red-light)] mb-4 px-8">
            {title}
          </h3>
        )}
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
      </div>
    );
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-56 w-[calc(100vw-224px)] min-h-screen bg-[var(--bg-primary)] py-8">
        <div className="px-8 mb-6">
          <h2 className="text-3xl font-bold text-[var(--red-light)] mb-6">
            Commissions
          </h2>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center mb-6">
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--red-light)] text-sm font-medium">
                View:
              </span>
              <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode("unified")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "unified"
                      ? "bg-[var(--red-primary)] text-white"
                      : "text-[var(--red-muted)] hover:text-[var(--red-light)]"
                  }`}
                >
                  Unified
                </button>
                <button
                  onClick={() => setViewMode("categories")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "categories"
                      ? "bg-[var(--red-primary)] text-white"
                      : "text-[var(--red-muted)] hover:text-[var(--red-light)]"
                  }`}
                >
                  By Category
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search commissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg text-[var(--red-light)] placeholder-[var(--red-muted)] focus:border-[var(--red-primary)] focus:outline-none"
              />
            </div>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg text-[var(--red-light)] focus:border-[var(--red-primary)] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="waitlist">Waitlist</option>
              <option value="payment">Payment</option>
              <option value="wip">WIP</option>
              <option value="finished">Finished</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg text-[var(--red-light)] focus:border-[var(--red-primary)] focus:outline-none"
              >
                <option value="date">Date</option>
                <option value="client">Client</option>
                <option value="category">Category</option>
                <option value="price">Price</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-lg text-[var(--red-light)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-[var(--red-muted)] text-sm mb-4">
            Showing {filteredAndSortedCommissions.length} of{" "}
            {commissions.length} commissions
          </div>
        </div>

        {viewMode === "unified" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {renderKanbanBoard(filteredAndSortedCommissions)}
            <DragOverlay>
              {activeCard ? (
                <KanbanCard commission={activeCard} isDragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="space-y-8">
            {categoryGroups.map(({ category, commissions }) => (
              <CategoryBoard
                key={category}
                category={category}
                commissions={commissions}
                setCommissions={setCommissions}
                setError={setError}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
