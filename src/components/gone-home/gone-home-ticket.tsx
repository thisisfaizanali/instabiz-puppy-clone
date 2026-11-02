import Image from "next/image";
import Link from "next/link";
import { coverStyle } from "@/lib/media";
import type { GoneHomeTicket as Ticket, Puppy } from "@/lib/types";

// Ticket tilts from the reference, repeating every six tickets, as does the stagger of the reveal.
const tilts = ["-1.4deg", "1.1deg", "-0.6deg", "1.6deg", "-1.1deg", "0.8deg"];

// One "ticket home" on /gone-home, linking to the puppy's page.
export function GoneHomeTicket({ puppy, ticket, index }: { puppy: Puppy; ticket: Ticket; index: number }) {
  const cover = puppy.media[0];
  return (
    <li className="tp-ticket" data-reveal style={{ "--tilt": tilts[index % tilts.length], "--i": index % tilts.length } as React.CSSProperties}>
      <Link className="tp-ticket__link" href={`/puppies/${puppy.slug}`}>
        <span className="tp-ticket__main">
          <span className="tp-ticket__photo">
            <Image src={cover.url} alt={cover.alt} fill sizes="7rem" style={coverStyle(cover)} className="object-cover" />
          </span>
          <span className="tp-ticket__body">
            <span className="font-scrawl tp-ticket__kicker">one ticket home</span>
            <span className="font-plush tp-ticket__name">{puppy.displayName}</span>
            <span className="tp-ticket__meta">{ticket.meta}</span>
            <span className="tp-ticket__route">
              <span>{ticket.from}</span>
              <svg viewBox="0 0 60 12" aria-hidden="true">
                <path d="M2 6h46" />
                <path d="M44 2l6 4-6 4" />
              </svg>
              <span>home ♥</span>
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="tp-ticket__stub">
          <span className="font-plush">admit one</span>
        </span>
      </Link>
    </li>
  );
}
