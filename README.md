# instabiz-puppy-clone

A clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/), the TeddyPups U.A.E. puppy site, built as a technical assignment. It has the same eight page types as the reference (home, available puppies, puppy detail, gone home, happy families, how it works, FAQ, contact), the same content and closely matching behaviour, with the enquiry forms wired to email.

Live site: [https://instabiz-puppy-clone.vercel.app/](https://instabiz-puppy-clone.vercel.app/)

## Tech stack

| Piece | Version | Used for |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 16.4 | App Router, Cache Components (`cacheComponents`), `proxy.ts`, `next/image`, metadata routes |
| React | 19 | UI, server actions, `useActionState` |
| TypeScript | 5 | Strict types across app, data and tests |
| Tailwind CSS | v4 | Utilities, with the page styles kept in CSS partials |
| [motion](https://motion.dev) | 14 | Entrances, shared layout and gallery animation |
| [lenis](https://lenis.darkroom.engineering) | 1.3 | Smooth wheel scrolling and anchor jumps |
| `next/font` | built in | Figtree, Fraunces and Shantell Sans, self-hosted at build time |
| [Resend](https://resend.com) | HTTP API | Enquiry email, called with `fetch` (no SDK) |
| ESLint | 9 | `eslint-config-next` core web vitals and TypeScript rules |

There are no other runtime dependencies. Tests use the built-in `node:test` runner.

## Getting started

Node 22.18 or newer is required: the tests run `.ts` files directly, which Node only does without a flag from that version.

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed to run locally.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (`src/**/*.test.ts`) with the Node test runner |

## Environment variables

Copy `.env.example` to `.env.local`. `.env.local` is git-ignored; never commit a real key.

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | For email | Resend API key used to send puppy enquiries. |
| `ENQUIRY_TO_EMAIL` | For email | Address that receives enquiries. Mail is sent from `onboarding@resend.dev`, which Resend only delivers to the address of the account that owns the key. |
| `SITE_URL` | No | Origin used for absolute URLs (`metadataBase`, canonical and share tags, sitemap, robots, JSON-LD, links in enquiry emails). Resolution order: `SITE_URL`, then `https://$VERCEL_PROJECT_PRODUCTION_URL` on Vercel, then `http://localhost:3000`. |

When either Resend variable is empty, enquiries are logged to the server console instead and the form still reports success. If only one of the two is set, the server also logs a one-line warning.

## Project structure

```
src/
  app/          Routes, root layout, not-found page, sitemap.ts, robots.ts, icons, globals.css
  components/   UI grouped by page (home/, puppies/, puppy/, contact/, ...) plus shared pieces
  data/         Puppies, gone-home tickets, FAQ, families and showroom content
  lib/          Site config, metadata helper, puppy filters, enquiry validation and sending, motion helpers, tests
  styles/       One CSS partial per page plus base, layout and shared components, imported in order by globals.css
  proxy.ts      Returns a real 404 for unknown puppy slugs
public/
  brand/        Logo, also used as the share image
  cursor/       Paw cursors
  media/        Puppy and family photos and videos
.github/
  workflows/    CI: lint, test and build
```

## How it matches the reference

**Data model.** `src/lib/types.ts` defines a `Puppy` with slug, breed labels, gender, age, colour, status (`available` or `gone-home`), origin (`local` or `imported`), breed and collection tags, and a media list whose first item is the cover. Each media item carries a focal point and a dominant colour, so crops match the reference and the image area has the right colour before it loads. There are 42 puppies: the available ones in `/puppies` order and the gone-home ones in `/gone-home` order. Previous and next links cycle within a puppy's own group, as on the reference.

**Filters with URL state.** Origin, breed, gender and collection live in the query string (`/puppies?origin=local&breed=maltipoo`). Clicking a chip replaces the history entry with `history.replaceState`, so there is no reload, no extra back step and the scroll position stays. Clicking the active chip clears it. An empty value means no filter and an unknown value matches nothing, as on the reference. The filter logic is plain functions in `src/lib/puppies.ts` and is unit tested.

**Server-rendered deep links.** `/puppies` reads the query on the server (behind `connection()` and a Suspense boundary), so a link such as `/puppies?breed=pomeranian` arrives with the filtered list and the right chips already active. Every puppy page is prerendered through `generateStaticParams`, and `sitemap.xml` lists all seven static routes plus all 42 puppy pages with their cover photos.

**Enquiry pipeline.** The forms on the puppy and contact pages post to the `sendEnquiry` server action. `validateEnquiry` (shared, tested) trims and checks the fields using the reference limits (name 2 to 80 characters, area up to 80, message up to 2000). A hidden `website` field acts as a honeypot: when it is filled in, the action reports success and sends nothing. Valid enquiries go to the Resend HTTP API with `fetch`. If the Resend variables are missing, the enquiry text is written to the server log and the form still succeeds, so local development works without a key. A Resend or network failure returns a message that points the visitor to WhatsApp, and the typed values are kept.

**Motion system and reduced motion.** `RevealScope` plays `[data-reveal]` entrances as they scroll into view. Only elements that start below the fold are armed (hidden), so server HTML and anything already on screen never flashes. A route curtain covers page changes and queues entrances until it lifts. `lenis` smooths wheel scrolling and in-page anchor jumps. Under `prefers-reduced-motion: reduce`, motion is configured with `reducedMotion="user"` (transforms and layout animation are skipped, opacity still fades), smooth wheel scrolling is off and every reveal is shown at once. The mascot (`teddy`) and the SVG puppy sketches are drawn from small tested geometry helpers in `src/lib`.

## Notable decisions and challenges

**`proxy.ts` for real 404s.** A puppy page streams its shell before the slug is checked, which fixes the response status at 200 even when the slug is unknown. `src/proxy.ts` matches `/puppies/:slug`, and for an unknown slug rewrites to a path no route handles, so the not-found page is served with a true 404 status. Unknown top-level paths already return 404 through the normal not-found handling. (The reference returns 200 with a "Puppy not found" page for unknown slugs.)

**`cacheComponents` and Suspense boundaries.** With Cache Components on, anything that reads request data (search params, `connection()`) has to sit behind a Suspense boundary or the build fails. The puppy page prerenders a static shell and reads `params` behind Suspense; the listing opts into per-request rendering for its filters. The build output marks `/puppies` and the puppy pages as partially prerendered.

**Filter deep links with no flash.** An early version prerendered the unfiltered list and swapped to the filtered one after hydration. Rendering the listing per request from the real URL removes the swap: the first HTML already has the right cards and the right active chips.

**Hydration-safe motion.** Anything that depends on `prefers-reduced-motion` or on scroll position would differ between server and client. `useReducedMotion` is built on `useSyncExternalStore` and reports "reduced" on the server and during hydration, so animation only starts after the client confirms the preference. Reveals arm elements in an effect rather than in the server markup for the same reason.

**CSS partials per page.** Styles live in `src/styles/`, one file per page plus `base`, `layout`, `components` and `pup`, imported in cascade order from `globals.css`. Tailwind utilities handle layout in the components; the partials hold the page-specific visual work (sketchbook, tickets, curtain) that would otherwise be long class strings.

**Preload warning findings.** The header logo appears on every page, so it uses `loading="eager"` instead of `priority`, which would add a preload link to each one. On a clean production build neither the clone nor the reference shows CSS preload warnings. The warning seen locally came from Next's prefetch responses (`s-maxage=900, stale-while-revalidate=31535100`) being replayed after a rebuild changed a CSS hash, so the cached payload preloads a stylesheet the new build never applies. The documented mitigation is `deploymentId`.

## Testing

- **Unit tests** use `node:test` and cover the filter functions, enquiry validation, the sketch generator and the mascot geometry (`npm test`).
- **CI** (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm test` and `npm run build` on every pull request and every push to `main`.
- **Manual checks** cover what unit tests do not. Layout and motion were compared against the reference in headless Chrome at 1440 and 375 pixel widths. Reduced motion was checked with Chrome DevTools Protocol emulation: transforms and layout animations are off, opacity fades are kept and smooth scrolling is off, as on the reference. Keyboard use was checked on the filters, gallery, lightbox, tabs and forms. The server HTML was checked with JavaScript off, and CLS was measured per page.

## Deployment

The site is built for Vercel.

1. Import the repository in Vercel. It detects Next.js and uses the default build settings.
2. Set `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` for the Production environment.
3. Set `SITE_URL` only when the site uses a custom domain other than the Vercel production domain. Static pages read it at build time, so redeploy after changing it.
