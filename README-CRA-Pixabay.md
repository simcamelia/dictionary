# React Dictionary (CRA) — Pixabay Integration Pack

This pack plugs **Pixabay images** into your **Create React App** dictionary and sets up Netlify correctly.

## What’s inside
- `src/components/Dictionary.jsx` — Dictionary + Pixabay (CRA env vars)
- `src/styles.css` — basic styling
- `src/App.js` — renders `Dictionary`
- `netlify.toml` — CRA build (`build`) + SPA redirects
- `.env.local.example` — template for your key

## 1) Add your API key (locally)
Create **`.env.local`** in your project root (same folder as `package.json`):
```
REACT_APP_PIXABAY_KEY=YOUR_PIXABAY_KEY_HERE
```

## 2) Netlify settings
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Environment variables:**  
  Key: `REACT_APP_PIXABAY_KEY` → Value: *your key*  
- After saving, go to **Deploys → Trigger deploy → Clear cache and deploy site**.

## 3) Wire up the files
Copy these into your repo, preserving paths.

If you already have an `App.js`, just mount the `<Dictionary />` component there.

## 4) Test locally
```bash
npm install
npm start
```
Search for a word like `dog` — you should see a definition and an image.

## Notes
- CRA requires environment variables to start with `REACT_APP_`.
- Do **not** commit `.env.local` to Git.
