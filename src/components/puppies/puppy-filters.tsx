"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getBreeds, getPuppies } from "@/lib/puppies";

const filterKeys = ["origin", "breed", "gender", "collection"] as const;
type FilterKey = (typeof filterKeys)[number];

// Filters live in the URL. As on the reference, changes replace the history entry
// (no new back step, no reload, scroll kept) and Next.js syncs useSearchParams.
export function usePuppyFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const filters = Object.fromEntries(filterKeys.map((k) => [k, params.get(k) ?? ""])) as Record<FilterKey, string>;
  // Clicking the active value clears it; any other value replaces it.
  const toggle = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (filters[key] !== value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };
  const clear = () => window.history.replaceState(null, "", pathname);
  return { filters, filtered: filterKeys.some((k) => filters[k]), toggle, clear };
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="tp-sticker-chip">
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-scrawl mr-1 w-full shrink-0 text-cocoa-soft sm:w-28">{label}</span>
      {children}
    </div>
  );
}

// "In Dubai" and "Korean Teacup" only appear while an available puppy has them.
const hasLocal = getPuppies({ origin: "local" }).length > 0;
const hasKoreanTeacup = getPuppies({ collection: "korean-teacup" }).length > 0;
const breeds = getBreeds();

export function PuppyFilters() {
  const { filters, filtered, toggle, clear } = usePuppyFilters();
  return (
    <div role="group" aria-label="Filter puppies" className="tp-sketchpad flex flex-col gap-4">
      <Group label="where">
        <Chip active={!filters.origin && !filters.collection} onClick={clear}>
          Everywhere
        </Chip>
        {hasLocal && (
          <Chip active={filters.origin === "local"} onClick={() => toggle("origin", "local")}>
            In Dubai
          </Chip>
        )}
        <Chip active={filters.origin === "imported"} onClick={() => toggle("origin", "imported")}>
          Imported
        </Chip>
        {hasKoreanTeacup && (
          <Chip active={filters.collection === "korean-teacup"} onClick={() => toggle("collection", "korean-teacup")}>
            Korean Teacup
          </Chip>
        )}
      </Group>
      <Group label="breed">
        {breeds.map((b) => (
          <Chip key={b.slug} active={filters.breed === b.slug} onClick={() => toggle("breed", b.slug)}>
            {b.name}
          </Chip>
        ))}
      </Group>
      <Group label="boy or girl">
        <Chip active={filters.gender === "male"} onClick={() => toggle("gender", "male")}>
          Boys
        </Chip>
        <Chip active={filters.gender === "female"} onClick={() => toggle("gender", "female")}>
          Girls
        </Chip>
        {filtered && (
          <button type="button" onClick={clear} className="link-ink ml-auto text-[0.95rem] font-semibold">
            Clear filters
          </button>
        )}
      </Group>
    </div>
  );
}
