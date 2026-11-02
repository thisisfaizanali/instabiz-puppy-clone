export type BreedSlug =
  | "maltipoo"
  | "pomeranian"
  | "poodle"
  | "cavapoo"
  | "shih-tzu"
  | "maltese"
  | "bichon"
  | "pomsky";

export type Breed = {
  slug: BreedSlug;
  name: string;
};

export type Origin = "local" | "imported";

type CollectionSlug = "korean-teacup";

export type Collection = {
  slug: CollectionSlug;
  name: string;
};

export type Media = {
  url: string;
  kind: "image" | "video";
  width: number;
  height: number;
  alt: string;
  caption: string;
  // Focal point as 0..1 fractions, used for object-position when cropping.
  focalX: number;
  focalY: number;
  // Dominant colour, shown behind the image while it loads.
  color: string;
  durationS: number | null;
  poster: Media | null;
};

export type Puppy = {
  slug: string;
  // Empty when the puppy has no given name; displayName is then the breed label.
  name: string;
  displayName: string;
  // Breed as displayed on the detail page, e.g. "Korean Teacup Maltipoo".
  breed: string;
  gender: "male" | "female" | "male-female";
  // Empty when the detail page shows no "Boy or girl" row.
  genderLabel: string;
  // Free text, e.g. "2.5 months" or "3 months Maltipoo & 2 months Cavapoo".
  age: string;
  colour: string;
  description: string;
  status: "available" | "gone-home";
  // The first item is the cover photo.
  media: Media[];
  origin: Origin;
  collections: CollectionSlug[];
  breeds: BreedSlug[];
};

// Extra fields shown on a /gone-home ticket. The ticket name and photo come from
// the puppy record (displayName and media[0]).
export type GoneHomeTicket = {
  // Ticket subtitle, e.g. "Pomeranian, boy", or just "Boy" when name is the breed.
  meta: string;
  from: "TeddyPups" | "Dubai showroom";
};

export type Testimonial = {
  quote: string;
  name: string;
  place: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
