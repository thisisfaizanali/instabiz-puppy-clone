# instabiz-puppy-clone

A clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/), built as a technical assignment.

## Tech stack

- Next.js 16 (App Router, Cache Components)
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint

## Getting started

Needs Node 22.18 or newer: the tests run `.ts` files directly, which Node only does without a flag from that version. CI (`.github/workflows/ci.yml`) runs lint, tests and a build on every pull request and push to `main`.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (`src/**/*.test.ts`) with the Node test runner |

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Never commit a real key; `.env.local` is git-ignored.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key for puppy enquiries. When it or `ENQUIRY_TO_EMAIL` is empty, enquiries are logged to the server console instead and the form still succeeds, so local development needs no key. If only one of the two is set, the server logs a one-line warning. |
| `ENQUIRY_TO_EMAIL` | Address that receives enquiries. Emails are sent from `onboarding@resend.dev`, which Resend only delivers to the address of the account that owns the key. |
| `SITE_URL` | Optional. Origin for absolute URLs (`metadataBase`, canonical and share tags, sitemap, robots, JSON-LD, enquiry emails), e.g. `https://example.com`. Resolution order: `SITE_URL`, then `https://$VERCEL_PROJECT_PRODUCTION_URL` on Vercel, then `http://localhost:3000`. Static pages read it at build time. |

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/puppies` | Available puppies, with breed and origin filters |
| `/puppies/[slug]` | Puppy detail and enquiry form (unknown slugs return 404) |
| `/gone-home` | Puppies that have gone home |
| `/happy-families` | Family photo wall |
| `/how-it-works` | How it works |
| `/faq` | Questions and answers |
| `/contact` | Visit and contact, with the letter form |
| `/sitemap.xml` | Every page plus each puppy's cover photo |
| `/robots.txt` | Crawl rules and the sitemap location |

Any other URL renders the 404 page.

## Project structure

```
src/
  app/          routes, root layout, not-found, sitemap.ts, robots.ts, icons, globals.css
  components/   UI, grouped by page (home/, puppies/, puppy/, contact/, ...) plus shared pieces
  data/         puppies, FAQ, families and other content
  lib/          site config, metadata helper, puppy filters, enquiry validation and sending, tests
  styles/       CSS partials, imported in order by globals.css
  proxy.ts      returns a real 404 for unknown puppy slugs
public/
  brand/        logo (also the share image)
  media/        puppy and family photos and videos
```

## Deploying to Vercel

1. Import the repository in Vercel.
2. Set `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL`. Set `SITE_URL` only if the site uses a custom domain other than the Vercel production domain.

Nothing else is needed; Vercel detects Next.js and uses the default build settings.
