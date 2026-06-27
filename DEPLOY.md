# Deploying the 11+ Mock Tests app

The app is plain static files (no build step), so hosting it is just "put these
files on HTTPS". GitHub Pages is free and matches how Laddy was deployed.

The repo is already initialised and committed locally on branch `main`. You just
need to create the GitHub repo and push.

---

## Step 1 — Create the GitHub repo

1. Go to <https://github.com/new> (signed in as **vpbalaji-droid**).
2. Repository name: **`eleven-plus`** (Public).
3. **Do NOT** add a README, .gitignore, or licence — the local repo already has
   commits and we don't want a conflict.
4. Create repository.

## Step 2 — Push (run these from this folder)

```bash
cd ~/.workspace/eleven-plus
git remote add origin https://github.com/vpbalaji-droid/eleven-plus.git
git push -u origin main
```

> When prompted for a password, use a **Personal Access Token** (classic), not
> your GitHub password. Create one at
> <https://github.com/settings/tokens> → *Generate new token (classic)* →
> tick **repo** scope → copy it and paste it as the password.
> (Same token you used for Laddy works if it hasn't expired.)

## Step 3 — Turn on Pages

1. Repo → **Settings ▸ Pages**.
2. *Build and deployment* → Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait ~1 minute. Your live URL appears at the top:

   **`https://vpbalaji-droid.github.io/eleven-plus/`**

## Step 4 — Install on a phone

1. Open the URL in **Chrome (Android)** or **Safari (iOS)**.
2. **Android:** menu ⋮ ▸ *Add to Home screen* ▸ Install.
   **iOS:** Share ▸ *Add to Home Screen*.
3. It opens full-screen with its own icon.

> The app is subpath-safe (all paths are relative), so it works correctly under
> `/eleven-plus/`. The service worker is network-first and the cache is at
> **ep-v5**, so updates ship on reload — no manual cache clearing needed.

---

## Updating later

After any change, bump `CACHE` in `sw.js` (e.g. `ep-v6`), then:

```bash
cd ~/.workspace/eleven-plus
git add -A && git commit -m "describe the change"
git push
```

Pages redeploys automatically within ~1 minute.

---

## Play Store (optional, later)

Same path as Laddy's DEPLOY.md Phase 2–3: wrap the hosted PWA with Bubblewrap
(TWA) into an `.aab` on your own machine, then upload to Play Console ($25
one-time). iOS would need Capacitor. Not needed for "use it on my phone today" —
Add to Home Screen already gives an installed app.
