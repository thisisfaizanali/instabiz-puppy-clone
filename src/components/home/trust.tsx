import { type Stamp, StampEntry, stampIcons } from "@/components/stamp";
import { Teddy } from "@/components/teddy";

const entries: Stamp[] = [
  {
    title: "Vet-checked & healthy",
    text: "Every puppy comes vaccinated, dewormed, and with a verified health certificate.",
    shape: "round",
    ink: "#a24a1a",
    tilt: "-8deg",
    icon: stampIcons.heart,
  },
  {
    title: "Korea to Dubai, safely",
    text: "Trusted breeders, safe travel, and premium care from start to finish.",
    shape: "ticket",
    ink: "#1f6b45",
    tilt: "5deg",
    icon: stampIcons.plane,
  },
  {
    title: "Support 24/7",
    text: "Always here to help, from choosing your puppy to post-delivery support.",
    shape: "oval",
    ink: "#5a3a28",
    tilt: "-4deg",
    icon: stampIcons.chat,
  },
  {
    title: "Trusted by families worldwide",
    text: "Puppies delivered to loving homes all around the world.",
    shape: "scallop",
    ink: "#c2622b",
    tilt: "7deg",
    icon: stampIcons.globe,
  },
];

export function Trust() {
  return (
    <section
      data-pup-scene
      data-tone="light"
      className="tp-scene tp-passport"
      style={{ "--sky-top": "#f0b866", "--sky-bottom": "#a65a30" } as React.CSSProperties}
      aria-labelledby="trust-title"
    >
      <div className="gutter mx-auto max-w-[96rem]">
        <div className="tp-book">
          <div className="tp-book__page tp-book__page--left">
            <p aria-hidden="true" className="tp-book__kicker font-scrawl">
              puppy passport
            </p>
            <h2 id="trust-title" className="font-plush tp-book__title">
              Why families trust TeddyPups
            </h2>
            <Teddy pose="sit" className="tp-book__teddy" />
          </div>
          <ul className="tp-book__page tp-book__page--right">
            {entries.map((entry, i) => (
              <StampEntry key={entry.title} stamp={entry} index={i} />
            ))}
          </ul>
        </div>
      </div>
      <div aria-hidden="true" className="tp-horizon">
        <span className="tp-horizon__sun" />
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tp-horizon__city">
          <path d="M0 160V118h34v-14h22v-22h30v34h18V96h26v30h22v-18h16v-30h34v40h20V70h28v56h24V98h18v-26h30v54h20v-38h26v-40l14-6 14 6v40h22v46h18V84h26v-30h22v50h24V76h36v50h20V96h18v-58h30v44h14V96h22v-30h16v22h26v-52l6-8v-24l4-6v-30l3-18 3 18v30l4 6v24l6 8v52h26v30h22V82h30v-20h24v48h20V90h28v-36h26v56h18V74h30v36h22V94h26v-24h30v62h20V102h26v20h34v38z" />
        </svg>
      </div>
    </section>
  );
}
