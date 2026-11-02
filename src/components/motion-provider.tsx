"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Reduced motion skips motion's transform and layout animations (opacity still fades), as on the reference.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
