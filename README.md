# Veo - Video Sharing Platform

Veo is a website where people can watch, upload and share videos.

- **Live site:** https://veo-tan.vercel.app/
- **Source code:** https://github.com/amitkumarsde/veo

---

## About the Project

Veo is a full-stack video sharing platform, similar in idea to YouTube. Anyone can browse and watch videos without an account. After signing up, a user can like videos, comment, subscribe to channels and open their own channel to publish videos.

### How it works

- **Visitors** see a home feed with a "Trending now" row, category filters, search and sorting (newest, popular, oldest).
- **Signed-in users** can like videos, comment, subscribe to channels and manage their profile.
- **Creators** open one channel and publish videos from it. A video can be an uploaded file or a pasted YouTube / MP4 link, with a title, description, thumbnail and categories.
- **The Studio** is the creator's dashboard. It shows channel totals (subscribers, views, likes, comments) and a list of the creator's videos to edit or delete.
- **Uploaded files** (videos, thumbnails, profile photos, channel banners and logos) are stored in Supabase Storage. MongoDB keeps only their links.

### Project highlights

- **Two parts:** a React website (`client`) and an Express REST API (`server`) that talk over JSON.
- **Secure by default:** passwords are hashed, every protected action is checked on the server, and all input is validated before it reaches the database.
- **Safe uploads:** each file's real type and size are checked on the server, not just its name.
- **Fast lists:** videos and comments load page by page as you scroll, and lists you have already seen open instantly when you go back.
- **Instant feedback:** likes and subscriptions update right away and undo themselves if saving fails.
- **Clean deletes:** deleting a video, channel or account also removes its comments, likes, subscriptions and stored files.
- **Server status:** the site tells you when the server is waking up and shows a clear message if it can't be reached.
- **Responsive and accessible:** works on phone, tablet and desktop, with keyboard support and a light / dark theme.

---

## Features

- Create an account, sign in and sign out
- Reset a forgotten password using your email
- Edit your profile: name, bio and photo
- Delete your account
- Create one channel with a name, description, banner and logo
- Upload a video file or paste a YouTube / MP4 link
- Add a title, description, thumbnail and categories to each video
- Edit and delete your own videos
- Watch videos, like them and share them
- Comment on videos, and edit or delete your own comments
- Subscribe to channels
- Search videos, filter by category and sort by newest, popular or oldest
- See your channel totals (subscribers, views, likes, comments) in the Studio

---

## Tech Stack

- **Client:** React, React Router, Tailwind CSS, Vite
- **Server:** Node.js, Express, MongoDB (Mongoose)
- **File storage:** Supabase Storage
- **Hosting:** Client on Vercel, server on Render

---

## Project Structure

```text
veo/
├── client/                  # React website
│   ├── public/              # Static files
│   └── src/
│       ├── app/             # App setup and routes
│       ├── components/      # Shared UI pieces
│       ├── features/        # Code for auth, videos, channels, comments, etc.
│       ├── hooks/           # Shared React hooks
│       ├── pages/           # One file per page
│       ├── services/        # Calls to the server API
│       └── utils/           # Small helper functions
│
├── server/                  # Express API
│   ├── scripts/             # Database migration script
│   └── src/
│       ├── routes/          # API URLs
│       ├── controllers/     # Read the request, send the response
│       ├── services/        # Business rules
│       ├── repositories/    # Database queries
│       ├── models/          # MongoDB schemas
│       ├── middleware/      # Auth, uploads, validation, errors
│       ├── validators/      # Input rules
│       └── config/          # Settings and database connection
│
└── package.json             # Shortcut scripts for both parts
```

---

## Requirements

- Node.js 22.9 or newer
- A MongoDB database (local or MongoDB Atlas)
- A Supabase Storage bucket (only needed for uploads)

---

## Setup

1. **Install packages** (from the project root):

   ```bash
   npm run install:all
   ```

2. **Create the server settings file.** Copy `server/.env.example` to `server/.env` and fill in:
   - `MONGO_URL` — your MongoDB connection string
   - `JWT_SECRET` — a long random text
   - `CORS_ORIGINS` — the website address (`http://localhost:5173` locally)
   - `STORAGE_*` — your Supabase Storage details (leave them empty to run without uploads)

3. **Create the client settings file.** Copy `client/.env.example` to `client/.env` and set:
   - `VITE_API_URL` — the server address (for example `http://localhost:5001`, matching `PORT` in `server/.env`)

---

## Run Locally

Open two terminals in the project root.

1. Start the server:

   ```bash
   npm run dev:server
   ```

2. Start the client:

   ```bash
   npm run dev:client
   ```

3. Open `http://localhost:5173` in your browser.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run install:all` | Installs packages for client and server |
| `npm run dev:server` | Starts the server and restarts it on changes |
| `npm run dev:client` | Starts the website in development mode |
| `npm run build` | Builds the website for production |
| `npm run lint` | Checks the client code for problems |
| `npm run db:migrate` | Updates the database to the current format and builds indexes |

---

## Deployment

### Server (Render)

1. Create a Web Service and set **Root Directory** to `server`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Health check path: `/health`
5. Add the settings from `server/.env.example` as environment variables, with `NODE_ENV=production`.
6. Set `CORS_ORIGINS` to your Vercel website address.
7. Run `npm run db:migrate` once against the production database after deploying.

### Client (Vercel)

1. Import the project and set **Root Directory** to `client`.
2. Add `VITE_API_URL` with your Render server address.
3. Deploy. `vercel.json` already handles page routing and security headers.

---

## Notes

- Each account can have only one channel.
- Supported uploads: JPG, PNG, WebP, GIF images and MP4, WebM, OGG videos.
- Default upload limits: 5 MB for images and 200 MB for videos.
- Password reset works with the email only (no email is sent). Set `ALLOW_PASSWORD_RESET_BY_EMAIL=false` to turn it off.
- On Render's free plan the server sleeps when idle, so the first visit can take up to a minute.

---