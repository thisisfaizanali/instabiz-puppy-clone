"use client";

import { motion, useScroll } from "motion/react";
import { useRef } from "react";

// The ribbon down the side of the storybook unrolls as you read: it fills from the top as the page scrolls.
export function StoryRibbon() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end end"] });
  return (
    <div ref={ref} aria-hidden="true" className="tp-ribbon">
      <div className="tp-ribbon__track">
        <motion.span className="tp-ribbon__band" style={{ scaleY: scrollYProgress }} />
      </div>
    </div>
  );
}
