import Image from "next/image";
import Link from "next/link";
import { coverStyle } from "@/lib/media";
import type { Puppy } from "@/lib/types";
import { Paw } from "./site-header";

const doorColours = ["#a24a1a", "#5a3a28", "#d4893f", "#b8644a", "#7a4a2e"];

const statusLabels: Record<Puppy["status"], string> = {
  available: "Available",
  "gone-home": "Gone home",
};

// "Max" gets "Maltipoo, boy, 3 months"; an unnamed puppy already shows its breed as the name.
export function puppyMeta(puppy: Puppy) {
  return [
    puppy.name && puppy.breed,
    puppy.genderLabel.toLowerCase(),
    puppy.age,
    puppy.media.some((m) => m.kind === "video") && "with video",
  ]
    .filter(Boolean)
    .join(", ");
}

export function PuppyCard({
  puppy,
  index,
  sizes = "(min-width: 1024px) 15rem, 44vw",
}: {
  puppy: Puppy;
  // Position in the list, which picks the door colour.
  index: number;
  sizes?: string;
}) {
  const cover = puppy.media[0];
  return (
    <li className="tp-door" data-open="true">
      <Link
        className="tp-door__link"
        style={{ "--door": doorColours[index % doorColours.length] } as React.CSSProperties}
        href={`/puppies/${puppy.slug}`}
      >
        <span className="tp-door__plate">
          <span className="font-plush tp-door__name">{puppy.displayName}</span>
          <span className="tp-door__meta">{puppyMeta(puppy)}</span>
        </span>
        <span className="tp-door__frame">
          <span className="tp-door__room">
            <Image src={cover.url} alt={cover.alt} fill sizes={sizes} className="object-cover" style={coverStyle(cover)} />
          </span>
          <span aria-hidden="true" className="tp-door__way">
            <span className="tp-door__leaf">
              <Paw className="tp-door__peephole" />
              <span className="tp-door__knob" />
            </span>
          </span>
          <span className="tp-door__tag font-scrawl">{statusLabels[puppy.status]}</span>
        </span>
      </Link>
    </li>
  );
}
