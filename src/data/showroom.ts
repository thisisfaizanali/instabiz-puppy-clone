import type { Media } from "@/lib/types";

const still = (url: string, alt: string, focalX: number, focalY: number, color: string): Media => ({
  url,
  kind: "image",
  width: 1080,
  height: 1920,
  alt,
  caption: "",
  focalX,
  focalY,
  color,
  durationS: null,
  poster: null,
});

// Stills of the apricot teddy bear puppy in the Downtown Dubai showroom, in reference order.
export const showroomPhotos = [
  still(
    "/media/FHyoHcIosLZE/60f6e7e00a/27b888_323008bb0f6a41d4bde2a0da7206cd98f000.jpg",
    "A tiny apricot teddy bear puppy held up in the TeddyPups showroom",
    0.543,
    0.483,
    "#685848",
  ),
  still(
    "/media/Vi-kzyvemRl4/e740ed8a24/27b888_323008bb0f6a41d4bde2a0da7206cd98f001.jpg",
    "The apricot teddy bear puppy from our showroom, close up",
    0.46,
    0.444,
    "#685848",
  ),
  still(
    "/media/g_e4ebbc7fyG/8276289ae7/27b888_323008bb0f6a41d4bde2a0da7206cd98f002.jpg",
    "The apricot teddy bear puppy from our showroom, looking up",
    0.437,
    0.402,
    "#080818",
  ),
  still(
    "/media/skvodl2NZiKq/cefab5eee9/27b888_323008bb0f6a41d4bde2a0da7206cd98f003.jpg",
    "The apricot teddy bear puppy from our showroom, held up to say hello",
    0.453,
    0.444,
    "#685848",
  ),
];

export const showroomVideo: Media = {
  url: "/media/dSAUmXs8Qai9/ef39cbea20/27b888_323008bb0f6a41d4bde2a0da7206cd98-720p.mp4",
  kind: "video",
  width: 406,
  height: 720,
  alt: "Video of a tiny apricot teddy bear puppy in the TeddyPups showroom",
  caption: "",
  focalX: 0.5,
  focalY: 0.5,
  color: "#685848",
  durationS: 15.58,
  poster: showroomPhotos[0],
};
