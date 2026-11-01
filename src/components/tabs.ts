"use client";

import { useEffect, useRef, useState } from "react";

// WAI-ARIA tabs with automatic activation, matching the reference: the first tab starts selected,
// Left/Right move focus and selection and wrap at the ends, and only the selected tab is in the tab
// order. Home/End are not handled. Panels stay visible until hydration so the content works without JS.
export function useTabs(keys: readonly string[]) {
  const [selected, setSelected] = useState(keys[0]);
  const [ready, setReady] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const select = (i: number) => {
    const n = (i + keys.length) % keys.length;
    setSelected(keys[n]);
    tabs.current[n]?.focus();
  };

  return {
    ready,
    index: Math.max(0, keys.indexOf(selected)),
    tabProps: (key: string, i: number) => ({
      ref: (el: HTMLButtonElement | null) => {
        tabs.current[i] = el;
      },
      type: "button" as const,
      role: "tab",
      id: `tab-${key}`,
      "aria-selected": selected === key,
      "aria-controls": `panel-${key}`,
      tabIndex: selected === key ? 0 : -1,
      onClick: () => setSelected(key),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") select(i + 1);
        if (e.key === "ArrowLeft") select(i - 1);
      },
    }),
    panelProps: (key: string) => ({
      role: "tabpanel",
      id: `panel-${key}`,
      "aria-labelledby": `tab-${key}`,
      hidden: ready && selected !== key,
    }),
  };
}
