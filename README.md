# Veo — Video Sharing Platform

A full-stack YouTube-style video sharing app built with the **MERN** stack
(MongoDB, Express, React, Node). Browse and search videos, watch them, comment,
and manage your own channel and uploads.

**Live Demo:** _add link here_

---

## ✨ Features

- **Browse & watch** — responsive home feed with a featured carousel, category chips, and a video grid.
- **Search & filter** — filter videos by title/uploader and by category, live as you type.
- **Accounts** — sign up and sign in; sessions are secured with JWT.
- **Channels** — create, edit, view, and delete your own channel.
- **Videos** — upload, update, and delete videos on your channel.
- **Comments** — add comments on any video; delete your own.
- **Light / dark theme** — toggle it; your choice is remembered.

---

## 🛠️ Tech Stack

| Layer        | Technologies                                                    |
| ------------ | --------------------------------------------------------------- |
| **Frontend** | React (Vite), React Router, Tailwind CSS, Axios, React Toastify |
| **Backend**  | Node.js, Express                                                |
| **Database** | MongoDB (Atlas or local) with Mongoose                          |
| **Auth**     | JWT + bcrypt password hashing                                   |

---

## 📁 Project Structure

```
veo/
├── backend/
│   ├── config/            # MongoDB connection
│   ├── controllers/       # Request handlers (users, channels, videos)
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Mongoose schemas (User, Channel, Video)
│   ├── routes/            # API route definitions
│   └── server.js          # Express app entry point
│
├── frontend/
│    ├── public/            # Static assets (logo)
│    └── src/
│        ├── main.jsx       # Entry point
│        ├── index.css      # Tailwind + theme tokens
│        ├── app/           # App shell, context providers, router
│        ├── components/    # Reusable UI (video cards, form shell, states)
│        ├── context/       # Global state: auth, search, theme
│        ├── hooks/         # Custom hooks (useAuth, useTheme, useChannel, ...)
│        ├── layouts/       # Header
│        ├── lib/           # Pure helpers (number/URL formatting)
│        ├── pages/         # Screens + forms (Home, VideoPlayer, SignIn, ...)
│        └── services/      # Axios instance and API calls
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local or MongoDB Atlas)

### 1. Clone
```bash
git clone https://github.com/amitkumarsde/veo.git
cd veo
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env` (copy the example and fill in your values):
```bash
cp .env.example .env
```

| Variable     | Description                                      |
| ------------ | ------------------------------------------------ |
| `MONGO_URL`  | MongoDB connection string (local or Atlas)       |
| `JWT_SECRET` | Secret used to sign JWTs — use a long, random string |
| `PORT`       | Port the API server listens on (default `5000`)  |

Run it:
```bash
npm run dev        # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env` (copy the example and fill in your values):
```bash
cp .env.example .env
```

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `VITE_API_URL` | Base URL of the backend API  |

Run it:
```bash
npm run dev        # http://localhost:5173
```

---

## 📡 API Reference

Base URL: `http://localhost:5000` — 🔒 requires a `Bearer <token>` header.

### Users
| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| POST   | `/users/signup`  | Register      |
| POST   | `/users/signin`  | Log in (returns a JWT) |

### Channels
| Method | Endpoint                        | Description        |
| ------ | ------------------------------- | ------------------ |
| GET    | `/channels`                     | List all channels  |
| GET    | `/channels/:channelId`          | Get one channel    |
| POST   | `/channels/create` 🔒           | Create a channel   |
| PUT    | `/channels/edit/:channelId` 🔒  | Edit your channel  |
| DELETE | `/channels/delete/:channelId` 🔒| Delete your channel|

### Videos
| Method | Endpoint                      | Description      |
| ------ | ----------------------------- | ---------------- |
| GET    | `/videos`                     | List all videos  |
| GET    | `/videos/:videoId`            | Get one video    |
| POST   | `/videos/upload` 🔒           | Upload a video   |
| PUT    | `/videos/update/:videoId` 🔒  | Update your video|
| DELETE | `/videos/delete/:videoId` 🔒  | Delete your video|
| POST   | `/videos/addComment` 🔒       | Add a comment    |
| DELETE | `/videos/deleteComment` 🔒    | Delete your comment |

---

## ⚙️ How It Works

1. The React frontend talks to the Express API through Axios (`VITE_API_URL`).
2. Express reads and writes data in MongoDB via Mongoose models.
3. On sign in, the server returns a **JWT**. The frontend stores it in `localStorage` and sends it on protected requests.
4. The `auth` middleware verifies the token and attaches the user to the request. Controllers then use that identity to enforce ownership — you can only edit or delete **your own** channels, videos, and comments.

---

## 📝 Notes

- Each user manages a single channel (the app surfaces the first channel).
- Likes, dislikes, and subscribe are client-side only — they give instant visual feedback but are not persisted to the database.
- Videos are embedded from YouTube URLs; the player extracts the video id from the link you provide.

---