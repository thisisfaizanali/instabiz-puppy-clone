import type { Media } from "./types.ts";

// Crops to the focal point and shows the dominant colour until the image loads.
export function coverStyle(media: Media) {
  return {
    objectPosition: `${media.focalX * 100}% ${media.focalY * 100}%`,
    backgroundColor: media.color,
  };
}
