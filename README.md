# Album Tracker

Album Tracker is a React app for finding music albums, previewing their tracks,
and keeping a personal listening log. Search the iTunes catalogue, open an album
to see its cover, year, genre and track list, play 30-second previews in a mini
player that keeps going while you browse, then save albums to your collection
with a listening status, a 1–5 star rating, and notes. Popular albums can also
be played in full through Deezer's embedded player, and an LLM-powered
recommendations page suggests new albums based on the albums and ratings already
in your collection.

![Search results screenshot](docs/search.png)

**Live site:** https://album-tracker-six.vercel.app
**GitHub repository:** https://github.com/darrelle01/album-tracker

## Features

- **Discover** — search the iTunes Search API (no key required) and browse up to
  24 album cards per search.
- **Album page** — large cover, artist, year, genre, track count, track list with
  durations, and links to Spotify, YouTube, and Apple Music.
- **30-second previews** — play, pause, skip, and seek with a fixed mini player
  that survives page changes.
- **My collection** — save albums with a status (*Want to listen*, *Listening*,
  *Listened*), a star rating, and free-text notes. Filter by status, search by
  title or artist, and sort by title, artist, or rating.
- **Persistence** — the collection is stored in `localStorage`, so it survives a
  refresh.
- **Full albums on Deezer** — a serverless function searches Deezer; when there
  is a confident match, the app offers Deezer's embedded player instead of the
  preview list.
- **AI recommendations** — a serverless function sends a taste profile (titles,
  artists, ratings, statuses) to Google Gemini, then each suggestion is verified
  against the iTunes API so invented albums are dropped.

## Tech stack

React 19, Vite, Context API, `localStorage`, iTunes Search API, Deezer API,
Google Gemini API, and Vercel serverless functions.

## Run it locally

```bash
git clone https://github.com/darrelle01/album-tracker.git
cd album-tracker
npm install
```

Create `.env.local` in the project root (next to `package.json`) and add your
Gemini key:

```dotenv
GEMINI_API_KEY=your-key-here
```

No quotes, no spaces, and **no `VITE_` prefix** — that prefix would expose the
key to the browser. Get a free key from [Google AI Studio](https://aistudio.google.com).

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:5173. The custom Vite config in `vite.config.js` runs the
files in `api/` locally, so `/api/deezer` and `/api/recommend` work with
`npm run dev`. Restart the server after changing `.env.local` or
`vite.config.js`.

Useful commands:

```bash
npm run build   # production build
npm run preview # preview the production build
npm run lint    # ESLint
```

## Screenshots

| Search | Album page | Recommendations |
| --- | --- | --- |
| ![Search](docs/search.png) | ![Album](docs/album.png) | ![Recommendations](docs/recommendations.png) |

> Replace these with your own screenshots if you prefer.

## Limitations

- Previews are 30 seconds because that is all the iTunes API provides.
- The collection lives only in this browser's `localStorage`; it is not synced
  to an account or another device.
- Deezer full playback needs you to be logged in to Deezer in the same browser,
  and depends on your plan and country. Without that, Deezer plays previews.
- The AI feature needs a valid Gemini key and is subject to free-tier rate
  limits. Model names change over time; set `GEMINI_MODEL` to a current model if
  the default is retired.
- iTunes and Deezer results depend on their public APIs being reachable.

## Privacy note

When you request recommendations, the app sends the **titles, artists, ratings,
and statuses** of up to 40 saved albums to Google's Gemini API. Your notes are
**not** sent. The API key stays on the server in a Vercel environment variable
and is never included in the React bundle.

This is a learning project and is not affiliated with Apple, Spotify, Deezer, or
Google. Music data, artwork, and audio belong to their respective owners.

## Reflection answers

> These are draft answers. Rewrite them in your own words so they reflect what
> you actually built and learned.

1. **Why is the audio element stored in a `useRef` instead of `useState`?**
   The `Audio` object needs to survive re-renders and keep playing; storing it
   in state would trigger needless re-renders and could recreate the element.
   A ref gives one stable instance that effects and event handlers can control
   directly.
2. **Why do all API calls live in `services/` instead of inside components?**
   Keeping URLs, `fetch` calls, and error handling in one place means components
   stay focused on UI, the same logic can be reused by several pages, and a
   changed endpoint only has to be updated once.
3. **Why can the Gemini key not be placed in React code? What could happen if
   you pushed it to GitHub?** Everything in the React bundle is downloaded to
   the browser, so anyone could read the key in DevTools. A key pushed to GitHub
   can be scraped by bots, abused to run up quota or billing, and would have to
   be revoked and replaced. The serverless function keeps it server-side.
4. **Why is this recommender an LLM prompt and not a trained machine learning
   model? Give one strength and one weakness.** The app sends a taste profile to
   a pre-trained model and asks it to reason in context; no model is trained on
   our data. Strength: no dataset, training pipeline, or ML infrastructure is
   needed, and the prompt can be changed quickly. Weakness: output is
   probabilistic and can hallucinate albums or reasons, so every suggestion must
   be verified, and it depends on an external API's limits and availability.
5. **Describe the hardest bug you hit and how you fixed it.**
   The hardest bug was Recommendations returning a 500 error on the live site
   while it worked locally. The Vercel variable was saved as `GEMIN_API_KEY`,
   with one `I` missing, so `process.env.GEMINI_API_KEY` was always empty even
   though I was sure the key was set. Renaming the variable and redeploying fixed
   it. Along the way I also had to send a browser-like `User-Agent` from the
   Deezer function, because Deezer blocked the default serverless request.

## Submission checklist

- [x] GitHub repository link: https://github.com/darrelle01/album-tracker
- [x] Live Vercel site link: https://album-tracker-six.vercel.app
- [x] Screenshot: search results (`docs/search.png`)
- [x] Screenshot: album page (`docs/album.png`)
- [x] Screenshot: recommendations (`docs/recommendations.png`)
- [x] No API key anywhere in the repository (`.env.local` is gitignored)
- [x] `GEMINI_API_KEY` added in Vercel → Settings → Environment Variables
- [ ] Reflection answers rewritten in your own words

## Suggested grading rubric

| Criteria | Points |
| --- | --- |
| Core app: search, album page, previews, mini player (Steps 1–10) | 25 |
| Collection: save, status, rating, notes, filter, sort, persistence | 20 |
| Code organization and readability | 10 |
| Deezer full-album option (Step 11) | 10 |
| AI recommendations (Step 12) | 15 |
| Deployment and environment variables (Step 13) | 10 |
| README quality | 5 |
| Reflection answers | 5 |
| **Total** | **100** |
