# instabiz-puppy-clone

A clone of [puppy.instabizweb.com](https://puppy.instabizweb.com/), built as a technical assignment.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- ESLint

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment variables

Puppy enquiries are emailed through the [Resend](https://resend.com) HTTP API. Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. When it or `ENQUIRY_TO_EMAIL` is empty, enquiries are logged to the server console instead of emailed, and the form still succeeds, so local development needs no key. If only one of the two is set, the server also logs a one-line warning. |
| `ENQUIRY_TO_EMAIL` | Address that receives enquiries. Emails are sent from `onboarding@resend.dev`, which Resend only delivers to the address of the account that owns the key. |

Never commit a real key; `.env.local` is git-ignored.

For a production build:

```bash
npm run build
```

## Project structure

```
src/
  app/
    layout.tsx    root layout, fonts, metadata
    page.tsx      home page
    globals.css   Tailwind import and brand theme tokens
    icon.png      app icon
    apple-icon.png
```
