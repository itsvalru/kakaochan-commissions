import React, { useState, useEffect, useRef } from "react";
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
  sortBy?: "date" | "client" | "category" | "price";
  sortOrder?: "asc" | "desc";
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
  sortBy = "date",
  sortOrder = "desc",
}: KanbanColumnProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showTopScrollIndicator, setShowTopScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Show scroll indicators when there are more than 3 items and not scrolled to top/bottom
  useEffect(() => {
    const checkScrollIndicators = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20; // 20px tolerance for smoother transition
        const isAtTop = scrollTop <= 20; // 20px tolerance for smoother transition
        const hasEnoughItems = filteredItems.length > 3;
        setShowScrollIndicator(hasEnoughItems && !isAtBottom);
        setShowTopScrollIndicator(hasEnoughItems && !isAtTop);
      }
    };

    // Initial check
    checkScrollIndicators();

    // Add scroll listener with throttling to prevent jumping
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            checkScrollIndicators();
            ticking = false;
          });
          ticking = true;
        }
      };

      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [filteredItems.length]);

  // Auto-scroll to show drop position when hovering
  useEffect(() => {
    if (isOver && activeCard && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const cardHeight = 88; // Approximate card height
      const spacing = 16; // Space between cards
      const totalCardHeight = cardHeight + spacing;

      // Calculate target scroll position based on ghost index
      let targetScrollTop = 0;

      if (ghostIndex >= 0) {
        // Calculate position for the ghost based on actual sorted items
        targetScrollTop = ghostIndex * totalCardHeight;

        // Ensure the ghost is visible in the viewport
        const containerHeight = scrollContainer.clientHeight;
        const ghostPosition = targetScrollTop;

        // If ghost would be below the visible area, scroll to show it
        if (
          ghostPosition + cardHeight >
          scrollContainer.scrollTop + containerHeight
        ) {
          targetScrollTop = ghostPosition - containerHeight + cardHeight + 80; // 80px padding to show full div with bottom padding
        }
        // If ghost would be above the visible area, scroll to show it
        else if (ghostPosition < scrollContainer.scrollTop) {
          targetScrollTop = ghostPosition - 80; // 80px padding to show full div with top padding
        }
      }

      // Smooth scroll to the target position
      scrollContainer.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, [isOver, activeCard, ghostIndex, filteredItems, sortBy, sortOrder]);

  return (
    <>
      <div className="w-full mb-4 flex items-center justify-center">
        <span
          className={`w-full text-center px-4 py-2 rounded-full font-semibold text-base ${group.color} shadow-sm`}
        >
          {group.label}
        </span>
      </div>
      <div className="relative">
        <motion.div
          layout
          className={`bg-[var(--bg-secondary)] rounded-2xl shadow-xl p-4 [&::-webkit-scrollbar]:hidden ${
            isOver
              ? "ring-2 ring-[var(--red-primary)] bg-[var(--bg-tertiary)]"
              : ""
          }`}
          style={{
            minHeight: "48px",
            maxHeight: "400px", // Limit height to show ~4 commissions
            overflowY: "auto",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.2,
          }}
          ref={scrollContainerRef}
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
              className="space-y-4 flex flex-col justify-center"
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

        {/* Top Scroll Indicator */}
        {showTopScrollIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-0 right-0 pointer-events-none z-20"
          >
            <div className="flex flex-col items-center">
              {/* Shadow fade effect - full width with rounded top corners */}
              <div className="w-full h-16 bg-gradient-to-b from-[var(--bg-secondary)] to-transparent rounded-t-2xl relative">
                {/* Up Arrow positioned at the top of the shadow div */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Scroll Indicator */}
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
          >
            <div className="flex flex-col items-center">
              {/* Shadow fade effect - full width with rounded bottom corners */}
              <div className="w-full h-16 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent rounded-b-2xl relative">
                {/* Down Arrow positioned at the bottom of the shadow div */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
