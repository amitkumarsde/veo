# Veo - Video Sharing Platform

[![CI](https://github.com/amitkumarsde/veo/actions/workflows/ci.yml/badge.svg)](https://github.com/amitkumarsde/veo/actions/workflows/ci.yml)

Veo is a website to watch, upload and share videos, like a small YouTube.

- **Live site:** https://veo-lilac.vercel.app/
- **Source code:** https://github.com/amitkumarsde/veo

---

## 📑 Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Settings (Environment Variables)](#-settings-environment-variables)
- [Scripts](#-scripts)
- [API](#-api)
- [Deployment](#-deployment)
- [Limits](#-limits)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

---

## 📖 About

- Anyone can watch videos without an account.
- After you register, you can like, comment, subscribe and make your own channels.
- Each account can have up to **3 channels**, and each channel has its own videos.
- The project has two parts:
  - **client** – the website (React), hosted on Vercel.
  - **server** – the API (Express + MongoDB), hosted on Render.
- Uploaded files (videos, thumbnails, photos, banners, logos) are kept in **Supabase Storage**. The database keeps only their links.

---

## ✨ Features

### Account
- Register, log in and log out (the menu on your photo in the header has Profile and Log out).
- Edit your name, bio and photo.
- Reset a forgotten password with your email (off by default, see [Security](#-security)).
- Delete your account, with everything you made.

### Channels
- Create up to 3 channels, each with a name, description, banner and logo.
- Switch between your channels in the **Studio**.
- Edit or delete a channel. Deleting it also removes its videos, comments and likes.
- Subscribe to other people's channels.

### Videos
- Upload a video file, or paste a YouTube or MP4 link.
- Add a title, description, thumbnail and categories.
- Choose which of your channels the video goes to.
- Edit or delete your own videos.

### Watching
- Home page with **Trending now**, categories, search and sort (Newest, Popular, Oldest).
- Like and share videos.
- Comment, and edit or delete your own comments.
- "Up next" list of related videos.

### Studio
- Totals for each channel: subscribers, views, likes and comments.
- List of the channel's videos to edit or delete.

### Good to know
- Works on phone, tablet and desktop.
- Light and dark theme.
- Lists load more as you scroll, and open instantly when you go back.
- Likes and subscriptions show at once and undo themselves if saving fails.
- If the server is asleep, the site says so and loads the page by itself once the server is up.

---

## 🧰 Tech Stack

- **Website:** React 19, React Router 7, Tailwind CSS 4, Vite
- **API:** Node.js 24, Express 5, Zod (input checks)
- **Database:** MongoDB with Mongoose
- **File storage:** Supabase Storage (through its S3 API)
- **Login:** JWT tokens, passwords hashed with bcrypt
- **Hosting:** Vercel (website), Render (API)
- **Checks:** GitHub Actions

---

## 📁 Project Structure

```text
veo/
├── .github/workflows/ci.yml   # Checks that run on every push
├── client/                    # Website
│   ├── public/                # Static files
│   ├── vercel.json            # Page routing and security headers for Vercel
│   └── src/
│       ├── app/               # App setup and page routes
│       ├── components/        # Shared building blocks (buttons, layout, ...)
│       ├── features/          # Code for login, channels, videos, comments, ...
│       ├── hooks/             # Shared React hooks
│       ├── pages/             # One file per page
│       ├── services/          # Calls to the API
│       └── utils/             # Small helpers
├── server/                    # API
│   ├── scripts/               # Database update (migrate) and pre-deploy check
│   └── src/
│       ├── routes/            # API addresses
│       ├── controllers/       # Read the request, send the reply
│       ├── services/          # App rules
│       ├── repositories/      # Database queries
│       ├── models/            # Database shapes
│       ├── middleware/        # Login check, uploads, input checks, errors
│       ├── validators/        # Input rules
│       └── config/            # Settings and database connection
└── package.json               # Shortcut commands for both parts
```

---

## 🚀 Getting Started

### What you need
- **Node.js 24**
- **A MongoDB database** (on your computer or on MongoDB Atlas)
- **A Supabase Storage bucket** (only if you want uploads)

### Steps

1. **Get the code**

   ```bash
   git clone https://github.com/amitkumarsde/veo.git
   ```

2. **Install packages** (run in the `veo` folder)

   ```bash
   npm run install:all
   ```

3. **Add the server settings**
   - Copy `server/.env.example` to `server/.env`.
   - Fill in at least `MONGO_URL` and `JWT_SECRET` (see [Settings](#-settings-environment-variables)).

4. **Add the website settings**
   - Copy `client/.env.example` to `client/.env`.
   - Set `VITE_API_URL` to the server address, e.g. `http://localhost:5000`.

5. **Update the database** (first time, and after updates that change data)

   ```bash
   npm run db:migrate
   ```

6. **Start the server** (first terminal)

   ```bash
   npm run dev:server
   ```

7. **Start the website** (second terminal)

   ```bash
   npm run dev:client
   ```

8. **Open** http://localhost:5173

---

## 🔧 Settings (Environment Variables)

### Server (`server/.env` locally, Render's Environment page online)

| Name | Needed? | What it is |
|---|---|---|
| `NODE_ENV` | No | `development` (default) or `production` |
| `PORT` | No | Server port, default `5000` |
| `MONGO_URL` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Long random text for login tokens; at least 32 characters in production |
| `CORS_ORIGINS` | **Yes in production** | Website address(es) allowed to call the API, comma separated |
| `TRUST_PROXY_HOPS` | No | Proxies in front of the server online, default `1` (see [Deployment](#server-on-render)) |
| `ALLOW_PASSWORD_RESET_BY_EMAIL` | No | `false` (default) or `true` (see [Security](#-security)) |
| `STORAGE_ENDPOINT` | For uploads | Supabase S3 address |
| `STORAGE_ACCESS_KEY` | For uploads | Supabase S3 access key |
| `STORAGE_SECRET_KEY` | For uploads | Supabase S3 secret key |
| `STORAGE_PUBLIC_URL` | For uploads | Public address of the bucket's files |
| `STORAGE_BUCKET` | No | Bucket name, default `veo` |
| `STORAGE_REGION` | No | Default `us-east-1` |
| `STORAGE_FORCE_PATH_STYLE` | No | Default `true` |
| `MAX_IMAGE_MB` | No | Largest image, default `5` |
| `MAX_VIDEO_MB` | No | Largest video, default `50` |

- Set **all four** storage values (endpoint, both keys, public URL) or **none**. With none, uploads are off and the rest still works.
- If a setting is wrong, the server stops and lists each problem under "Invalid environment configuration".

### Website (`client/.env` locally, Vercel's Environment Variables online)

| Name | Needed? | What it is |
|---|---|---|
| `VITE_API_URL` | **Yes** | API address, e.g. `http://localhost:5000` or your Render address |
| `VITE_MAX_IMAGE_MB` | No | Same value as `MAX_IMAGE_MB` on the server |
| `VITE_MAX_VIDEO_MB` | No | Same value as `MAX_VIDEO_MB` on the server |

---

## 📜 Scripts

Run these in the `veo` folder.

| Command | What it does |
|---|---|
| `npm run install:all` | Installs packages for the website and the server |
| `npm run dev:server` | Starts the server and restarts it when code changes |
| `npm run dev:client` | Starts the website for development |
| `npm run build` | Builds the website for production |
| `npm run lint` | Checks the website code for mistakes |
| `npm run db:migrate` | Updates the database and its indexes (saves a backup first) |
| `npm run check` | Lint + build + server start check. Run it before every push |

---

## 🔌 API

- Every reply looks like `{ "success": true, "message": "...", "data": ... }`.
- 🔒 = you must be logged in (send `Authorization: Bearer <token>`).

### Status
- `GET /` – the server is running
- `GET /health` – server and database status

### Users
- `POST /users/register` – create an account
- `POST /users/login` – log in, get a token
- `POST /users/reset-password` – set a new password by email (only if turned on)
- 🔒 `GET /users/me` – your account
- 🔒 `PATCH /users/me` – edit name, bio or photo
- 🔒 `DELETE /users/me` – delete your account (needs your password)

### Channels
- 🔒 `POST /channels` – create a channel
- `GET /channels/:channelId` – channel details
- 🔒 `PATCH /channels/:channelId` – edit your channel
- 🔒 `DELETE /channels/:channelId` – delete your channel
- 🔒 `PUT /channels/:channelId/subscribe` – subscribe or unsubscribe

### Videos
- `GET /videos` – list videos (search `q`, `category`, `channelId`, `sort`, paging `cursor` and `limit`)
- `GET /videos/categories` – most used categories
- 🔒 `POST /videos` – add a video
- `GET /videos/:videoId` – video details
- 🔒 `PATCH /videos/:videoId` – edit your video
- 🔒 `DELETE /videos/:videoId` – delete your video
- `GET /videos/:videoId/related` – related videos
- 🔒 `PUT /videos/:videoId/like` – like or unlike
- `POST /videos/:videoId/views` – count a view

### Comments
- `GET /videos/:videoId/comments` – list comments
- 🔒 `POST /videos/:videoId/comments` – add a comment
- 🔒 `PATCH /videos/:videoId/comments/:commentId` – edit your comment
- 🔒 `DELETE /videos/:videoId/comments/:commentId` – delete your comment

---

## 🌐 Deployment

- Pushing to `main` deploys both parts.
- **GitHub Actions** (`.github/workflows/ci.yml`) checks every push and pull request:
  - Website: install, lint, build.
  - Server: install, start check.
- A failed check shows a red ✗ on GitHub, and Render won't deploy it.

### Server on Render
1. Create a **Web Service** from the repository.
2. **Root Directory:** `server`
3. **Build Command:** `npm ci`
4. **Start Command:** `npm start`
5. **Health Check Path:** `/health`
6. **Auto-Deploy:** "After CI Checks Pass"
7. **Environment:** add the [server settings](#server-serverenv-locally-renders-environment-page-online). Online you need at least:
   - `NODE_ENV=production`
   - `MONGO_URL`
   - `JWT_SECRET` (use Render's **Generate** button)
   - `CORS_ORIGINS` (your Vercel address)
   - `TRUST_PROXY_HOPS=1`
   - the four `STORAGE_*` values, if you want uploads
8. Click **Save, rebuild, and deploy**.
9. Check `TRUST_PROXY_HOPS`:
   - Open `https://<your-api>/health`.
   - `yourIp` should be **your own** IP.
   - If not, add 1 to `TRUST_PROXY_HOPS` and deploy again.

### Website on Vercel
1. Import the repository.
2. **Root Directory:** `client`
3. Add `VITE_API_URL` = your Render address, e.g. `https://veo-api.onrender.com`.
4. Deploy. `vercel.json` already handles page links and security headers.
5. After changing `VITE_API_URL`, **redeploy** (it is built into the site).

### Database updates
- Run `npm run db:migrate` against the online database:
  - once after the first deploy, and
  - after any update that changes how data is stored or adds indexes.
- It saves a backup of every collection to `server/backups/` first.
  - These backups contain emails and password hashes. They are never pushed to git; delete them when you no longer need them.
- It is safe to run more than once.

### Before each push
1. Run `npm run check`.
2. Push to `main`.
3. Check the Render log shows `Server listening on port ...`.

---

## 📏 Limits

### Size limits
- **Images:** JPG, PNG, WebP or GIF, up to 5 MB.
- **Videos:** MP4, WebM or OGG, up to 50 MB (the largest file Supabase's free plan accepts).
- **Text:**
  - Name: 2–50 characters
  - Bio: 200 characters
  - Password: at least 6 characters
  - Channel name: 50 characters
  - Channel description: 1000 characters
  - Video title: 100 characters
  - Video description: 5000 characters
  - Categories: 1–10, each up to 30 characters
  - Comment: 1000 characters

### Count limits
- **Channels:** up to 3 per account. Change `channelsPerUser` in both `server/src/constants/limits.js` and `client/src/constants/limits.js`.
- **Login session:** lasts 2 days.

### Speed limits
- Log in / register: 20 tries per 15 minutes per visitor
- Password reset: 5 tries per 15 minutes per visitor
- Uploads: 20 per 15 minutes per user
- Comments: 10 per minute per user
- Views: one per visitor per video every 10 minutes

### Other rules
- **Channel links** are made from the first channel name (e.g. `/channel/my-chess`) and never change, even after a rename.

---

## 🔐 Security

- Passwords are hashed and never sent back.
- Every change (edit, delete, upload) is checked on the server: you can only change your own things.
- All input is checked before it reaches the database.
- Uploaded files are checked by their real content, not just their name.
- Resetting your password logs out your old sessions.
- **Password reset by email is off by default.**
  - It needs only the email (no email is sent), so anyone who knows an address could take over that account.
  - Keep `ALLOW_PASSWORD_RESET_BY_EMAIL=false` online unless you accept that.

---

## 🩺 Troubleshooting

- **"Starting the server…" or "temporarily unavailable"**
  - On Render's free plan, the server sleeps when no one uses it and can take about a minute to wake up.
  - The site keeps checking and loads by itself once the server is up.
- **Server stops with "Invalid environment configuration"**
  - The log lists each wrong or missing setting. Fix them and deploy again.
- **Website build fails with "VITE_API_URL is not set"**
  - Add `VITE_API_URL` in Vercel (or `client/.env`) and build again.
- **The website can't reach the API (CORS error in the browser)**
  - Put the exact website address in `CORS_ORIGINS` on Render, with no `/` at the end.
- **Can't create a second channel ("Please try again")**
  - Run `npm run db:migrate` once against that database.
- **Uploads say "not available"**
  - Set all four `STORAGE_*` settings, and make sure the bucket exists and is public in Supabase.

---