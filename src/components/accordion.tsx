import type { ReactNode } from "react";

// One disclosure in an accordion: a heading button that toggles its answer region. The parent owns
// which items are open. The closed region stays in the DOM (inert) so its height can animate.
export function AccordionItem({
  id,
  open,
  onToggle,
  summary,
  children,
  className,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  summary: ReactNode;
  children: ReactNode;
  className: { heading: string; answer: string };
}) {
  return (
    <>
      <h2 className={className.heading}>
        <button type="button" id={`q-${id}`} aria-expanded={open} aria-controls={`a-${id}`} onClick={onToggle}>
          {summary}
        </button>
      </h2>
      <div id={`a-${id}`} role="region" aria-labelledby={`q-${id}`} className={className.answer} inert={!open}>
        {children}
      </div>
    </>
  );
}
