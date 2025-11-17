// src/hooks/usePrefersReducedMotion.ts
import { useEffect, useState } from "react";

const PREFERS_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const usePrefersReducedMotion = (): boolean => {
  const getInitialValue = () => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return false;
    }

    return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  };

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    getInitialValue,
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
};
