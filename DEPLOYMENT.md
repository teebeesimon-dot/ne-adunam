# Ne Adunam — Vercel deployment checklist

Use this checklist before and after deploying to Vercel production.

## Pre-deploy (local)

- [ ] Copy `.env.example` to `.env.local` and fill in all values
- [ ] Run `npm install`
- [ ] Run production build locally:
  ```bash
  npm run build
  ```
- [ ] Run production server locally and smoke-test:
  ```bash
  npm run start
  ```
- [ ] Confirm Google Sign-In works on `http://localhost:3000`
- [ ] Confirm create event, attendance, and event page load

## Vercel project setup

- [ ] Import repository in [Vercel](https://vercel.com/new)
- [ ] Set **Root Directory** to `ne-adunam` if the repo root is the parent folder
- [ ] Framework preset: **Next.js**
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)

## Environment variables (Vercel → Settings → Environment Variables)

Set for **Production** (and Preview if needed):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Recommended | Production URL, e.g. `https://ne-adunam.vercel.app` — used for SEO |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `ne-adunam.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | e.g. `ne-adunam` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | e.g. `ne-adunam.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Numeric sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Web app ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Recommended | Places API for location autocomplete |

Build fails in production if any **required** Firebase variable is missing (`next.config.ts` validates on build).

## Firebase Console

### Authentication

- [ ] Enable **Google** sign-in provider
- [ ] Add authorized domains:
  - `localhost` (development)
  - Your Vercel domain, e.g. `ne-adunam.vercel.app`
  - Custom domain if configured

### Firestore

- [ ] Deploy security rules from project root:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] Create composite indexes if Firestore prompts in the browser console:
  - `events`: `ownerId` + `date`
  - `responses`: `eventId` (if needed for queries)

### Authorized domains (Firebase Auth)

- [ ] Project settings → Authorized domains includes Vercel URL

## Google Cloud (Maps)

- [ ] Enable **Places API** (and Maps JavaScript API if required)
- [ ] Restrict API key:
  - **HTTP referrers**: `https://your-domain.vercel.app/*`, `http://localhost:3000/*`
  - Limit to Places API / Maps JavaScript API only

## Deploy

- [ ] Push to main (or trigger deploy from Vercel dashboard)
- [ ] Wait for build to succeed — env validation runs during `next build`
- [ ] Open production URL and verify:
  - [ ] Home page loads with app name **Ne Adunam**
  - [ ] Favicon shows **NA** badge
  - [ ] Google Sign-In works
  - [ ] Create event (organizer role)
  - [ ] Event page + attendance
  - [ ] WhatsApp share link
  - [ ] Location autocomplete (if Maps key set)

## SEO & metadata

- [ ] `NEXT_PUBLIC_APP_URL` matches live domain
- [ ] Check `/robots.txt` and `/sitemap.xml`
- [ ] Verify Open Graph tags (share link preview) with [opengraph.xyz](https://www.opengraph.xyz/) or similar
- [ ] Confirm page title: **Ne Adunam** in browser tab

## Error handling

- [ ] Visit a non-existent route — should show custom **404**
- [ ] Confirm client errors show **Ceva nu a mers bine** with retry (trigger only if needed)

## Post-deploy security

- [ ] Firestore rules deployed and tested (non-owner cannot edit others' events)
- [ ] Google Maps API key restricted by referrer
- [ ] No secrets committed in git (only `.env.example` with empty placeholders)

## Optional

- [ ] Add custom domain in Vercel → update `NEXT_PUBLIC_APP_URL` and Firebase authorized domains
- [ ] Enable Vercel Analytics
- [ ] Set up Firebase Hosting redirect only if using custom domain split (not required for Vercel-only)

## Troubleshooting

| Issue | Likely cause |
|-------|----------------|
| Build fails on Vercel | Missing `NEXT_PUBLIC_FIREBASE_*` env vars |
| Google Sign-In popup fails | Domain not in Firebase authorized domains |
| Firestore permission denied | Rules not deployed or user not signed in |
| Maps autocomplete empty | Missing key, API not enabled, or referrer restriction |
| Wrong SEO / share preview | `NEXT_PUBLIC_APP_URL` not set to production URL |
