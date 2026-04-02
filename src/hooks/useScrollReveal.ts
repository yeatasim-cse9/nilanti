import { useEffect, useRef } from "react";

/**
 * Intersection Observer-based scroll reveal hook.
 * Uses MutationObserver to catch dynamically added elements.
 */
export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const revealSelector = ".reveal, .reveal-left, .reveal-scale";

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    // Observe existing elements
    const observeAll = () => {
      container.querySelectorAll(revealSelector).forEach((el) => {
        if (!el.classList.contains("revealed")) {
          io.observe(el);
        }
      });
    };

    observeAll();

    // Watch for dynamically added elements (data-fetched sections)
    const mo = new MutationObserver(() => {
      observeAll();
    });
    mo.observe(container, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return containerRef;
}
