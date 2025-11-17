// src/features/datagrid/config/motionSettings.ts
import type { Transition } from "framer-motion";

// Durations (seconds)
export const MOTION_DURATION_FAST = 0.15;
export const MOTION_DURATION_MEDIUM = 0.22;
export const MOTION_DURATION_SLOW = 0.3;

export const MOTION_DURATIONS = {
  fast: MOTION_DURATION_FAST,
  medium: MOTION_DURATION_MEDIUM,
  slow: MOTION_DURATION_SLOW,
} as const;

export type MotionDurationKey = keyof typeof MOTION_DURATIONS;

// Easing (cubic-bezier)
export const MOTION_EASING_STANDARD: [number, number, number, number] = [
  0.2, 0.0, 0.2, 1.0,
];

export const MOTION_EASING_EMPHASIZED: [number, number, number, number] = [
  0.2, 0.0, 0.0, 1.0,
];

// Small elevation used for row hover (px)
export const MOTION_ELEVATION_TRANSLATE_Y = -2;

// Basic settings bag if you ever need to thread it down
export interface MotionSettings {
  reducedMotion: boolean;
}

// Generic helper to build a Transition based on tokens
export const createMotionTransition = (
  speed: MotionDurationKey = "medium",
  options?: {
    emphasized?: boolean;
    reducedMotion?: boolean;
  },
): Transition => {
  const { emphasized = false, reducedMotion = false } = options ?? {};

  if (reducedMotion) {
    // Effectively disable animation while keeping Framer Motion happy
    return { duration: 0 };
  }

  return {
    duration: MOTION_DURATIONS[speed],
    ease: emphasized ? MOTION_EASING_EMPHASIZED : MOTION_EASING_STANDARD,
  };
};

// Convenience helper for MotionConfig default transition
export const getDefaultMotionTransition = (
  reducedMotion: boolean,
): Transition => {
  return createMotionTransition("medium", { reducedMotion });
};
