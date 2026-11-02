import { cream, eyeY, floorY, frameOf, fur, furShade, H, ink, legs, paths, poses, toes, W, blush, collar, type PoseName } from "@/lib/teddy-shape";

const line = { stroke: ink, strokeWidth: 3.4, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const outline = { ...line, fill: "none" };

function Leg({ part, d, len, fill, transform, opacity }: { part: string; d: string; len: number; fill: string; transform: string; opacity?: number }) {
  return (
    <g data-p={part} transform={transform} opacity={opacity}>
      <path d={`${d}Z`} fill={fill} />
      <path d={d} {...outline} />
      <path d={toes(len)} {...outline} strokeWidth={2.4} />
    </g>
  );
}

function Eyes() {
  return (
    <>
      <ellipse cx={194} cy={eyeY} rx={7.4} ry={8.6} fill={ink} />
      <ellipse cx={230} cy={eyeY} rx={7.4} ry={8.6} fill={ink} />
      <circle cx={196.6} cy={eyeY - 3.4} r={2.7} fill="#fff" />
      <circle cx={232.6} cy={eyeY - 3.4} r={2.7} fill="#fff" />
      <circle cx={192} cy={eyeY + 3.2} r={1.2} fill="#fff" />
      <circle cx={228} cy={eyeY + 3.2} r={1.2} fill="#fff" />
    </>
  );
}

// Teddy in a resting pose. Every moving part carries a data-p name so a rig can pose it live.
export function TeddySvg({ pose = "sit", facing = "right", label }: { pose?: PoseName; facing?: "left" | "right"; label?: string }) {
  const f = frameOf(poses[pose]);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: "visible" }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label || undefined}
      focusable="false"
    >
      <g data-p="root" transform={facing === "left" ? `translate(${W} 0) scale(-1 1)` : undefined}>
        <ellipse
          data-p="shadow"
          {...paths.shadow}
          fill={ink}
          opacity={f.shadowOpacity}
          transform={f.shadow}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <g data-p="body" transform={f.body} opacity={f.side}>
          <Leg part="bf" d={legs.backFar} len={floorY - 192} fill={furShade} transform={f.bf} opacity={f.backLegs} />
          <Leg part="ff" d={legs.frontFar} len={floorY - 192} fill={furShade} transform={f.ff} />
          <g data-p="tail" transform={f.tail}>
            <path d={paths.tailStem} {...outline} strokeWidth={9} />
            <path d={paths.tailStem} stroke={fur} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d={paths.tail} fill={fur} {...line} />
          </g>
          <Leg part="bn" d={legs.back} len={floorY - 194} fill={fur} transform={f.bn} opacity={f.backLegs} />
          <path d={paths.body} fill={fur} {...line} />
          <path d={paths.chest} fill={fur} {...line} />
          <Leg part="fn" d={legs.front} len={floorY - 194} fill={fur} transform={f.fn} />
        </g>
        <g data-p="haunch" opacity={f.haunchOpacity} transform={f.haunch}>
          <path d={paths.haunch} fill={fur} {...line} />
          <path d={paths.haunchPaw} fill={fur} {...line} />
          <path d="M132 222v5M139 222v5" {...outline} strokeWidth={2.4} />
        </g>
        <g data-p="head" transform={f.head}>
          <path d={paths.collar} fill={collar} {...line} strokeWidth={3} />
          <path d={paths.tag} fill={cream} {...line} strokeWidth={2.4} />
          <path data-p="earL" d={paths.earL} fill={furShade} {...line} transform={f.earL} />
          <path data-p="earR" d={paths.earR} fill={furShade} {...line} transform={f.earR} />
          <path d={paths.head} fill={fur} {...line} />
          <path d={paths.topknot} fill={fur} {...line} strokeWidth={3} />
          <path d={paths.muzzle} fill={cream} />
          <circle cx={181} cy={116} r={7} fill={blush} opacity={0.85} />
          <circle cx={243} cy={116} r={7} fill={blush} opacity={0.85} />
          <g data-p="eyes" transform={f.eyes}>
            <g data-p="open" opacity={f.openEyes}>
              <g data-p="blink" transform={f.blink}>
                <Eyes />
              </g>
            </g>
          </g>
          <path data-p="happy" d="M186.5 101 Q194 91.5 201.5 101 M222.5 101 Q230 91.5 237.5 101" {...outline} opacity={f.happyEyes} />
          <path data-p="shut" d="M186.5 97 Q194 103.5 201.5 97 M222.5 97 Q230 103.5 237.5 97" {...outline} opacity={f.shutEyes} />
          <path d={paths.nose} fill={ink} />
          <path d={paths.mouth} {...outline} strokeWidth={3} />
          <path data-p="tongue" d={paths.tongue} fill="#e98c8c" stroke={ink} strokeWidth={2.2} strokeLinejoin="round" opacity={f.tongue} />
          <g data-p="mouth" opacity={f.mouth}>
            <path d={paths.mouthOpen} fill="#6b2a1c" {...line} strokeWidth={2.6} />
            <path d="M206.5 133.5 Q212 130 217.5 133.5 Q215 138 212 138 Q209 138 206.5 133.5 Z" fill="#e98c8c" />
          </g>
        </g>
        <g data-p="ledge" opacity={f.ledge}>
          <path d={paths.ledgePaws} fill={fur} {...line} />
          <path d={paths.ledgeToes} {...outline} strokeWidth={2.4} />
        </g>
      </g>
    </svg>
  );
}
