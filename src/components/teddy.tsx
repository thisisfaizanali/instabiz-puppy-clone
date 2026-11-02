import type { PoseName } from "@/lib/teddy-shape";
import { PupBuddy } from "./pup-buddy";

// One of Teddy's resting spots. The data attributes tell the travelling puppy how to sit here.
export function Teddy({
  pose,
  facing = "right",
  act,
  behind = false,
  lane = false,
  label,
  className = "",
}: {
  pose: PoseName;
  facing?: "left" | "right";
  act?: string;
  behind?: boolean;
  lane?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div
      data-pup-stop
      data-pose={pose}
      data-facing={facing}
      data-act={act}
      data-behind={behind || undefined}
      data-lane={lane || undefined}
      className={`pup-stop ${className}`}
    >
      <PupBuddy pose={pose} facing={facing} label={label} asStop />
    </div>
  );
}
