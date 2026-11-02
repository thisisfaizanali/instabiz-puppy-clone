import Image from "next/image";

// The TeddyPups mascot at one of its resting spots, drawn in a fixed pose.
export function Teddy({
  pose,
  label = "",
  className,
  loading,
}: {
  pose: "peek" | "sit" | "bow";
  label?: string;
  className: string;
  loading?: "eager";
}) {
  return (
    <div className={`pup-stop ${className}`}>
      <Image
        src={`/teddy/${pose}.svg`}
        alt={label}
        width={300}
        height={240}
        loading={loading}
        unoptimized
        className="block h-auto w-full"
      />
    </div>
  );
}
