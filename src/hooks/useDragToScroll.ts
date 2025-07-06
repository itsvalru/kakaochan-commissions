import { useEffect, useRef } from "react";

export function useDragToScroll() {
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const col = columnRef.current;
    if (!col) return;

    let isDragging = false;
    let startX = 0;
    let scrollX = 0;

    // Find the scrollable parent (the board)
    function getBoardScrollParent(el: HTMLElement | null): HTMLElement | null {
      while (el && el.parentElement) {
        if (el.parentElement.classList.contains("overflow-x-auto")) {
          return el.parentElement;
        }
        el = el.parentElement;
      }
      return null;
    }

    const board = getBoardScrollParent(col);
    if (!board) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-draggable]")) return;
      isDragging = true;
      startX = e.clientX;
      scrollX = board.scrollLeft;
      board.style.cursor = "grabbing";
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      board.scrollLeft = scrollX - dx;
      e.preventDefault();
    };

    const handleMouseUp = () => {
      isDragging = false;
      board.style.cursor = "grab";
    };

    // Touch support
    let touchStartX = 0;
    let touchScrollX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-draggable]")) return;
      isDragging = true;
      touchStartX = e.touches[0].clientX;
      touchScrollX = board.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - touchStartX;
      board.scrollLeft = touchScrollX - dx;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    col.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    col.addEventListener("touchstart", handleTouchStart, { passive: false });
    col.addEventListener("touchmove", handleTouchMove, { passive: false });
    col.addEventListener("touchend", handleTouchEnd);

    return () => {
      col.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      col.removeEventListener("touchstart", handleTouchStart);
      col.removeEventListener("touchmove", handleTouchMove);
      col.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return columnRef;
}
