import { useRef, useEffect, useCallback } from 'react';

/**
 * Edge-swipe-back gesture hook.
 * Detects swipes starting from the left 25px edge of the screen
 * and calls `onBack` when a valid swipe-back is detected.
 *
 * Only triggers when:
 * - Touch starts within 25px of the left edge
 * - Horizontal distance > 80px
 * - Horizontal distance > 2x vertical distance (mostly horizontal)
 */
export function useEdgeSwipeBack(onBack: () => void, enabled = true) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isEdgeSwipe = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const x = e.touches[0].clientX;
    startX.current = x;
    startY.current = e.touches[0].clientY;
    // Only track if touch starts within 25px of left edge
    isEdgeSwipe.current = x <= 25;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isEdgeSwipe.current) return;
    isEdgeSwipe.current = false;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current);

    // Must swipe right at least 80px, and be mostly horizontal
    if (dx > 80 && dx > dy * 2) {
      onBack();
    }
  }, [onBack]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
}
