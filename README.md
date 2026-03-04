# 🎧 Aurafy — Mood-to-Playlist & Study App

> Chat with an AI about your day, get a personalized Spotify playlist, and study smarter with built-in focus tools.

---

## Overview

Aurafy combines AI-powered mood detection, Spotify playlist generation, and study productivity tools into one experience. Describe how you're feeling, and Aurafy figures out your mood, builds a matching playlist, and plays it — all without leaving the app.

---

## Features

### 🎵 Mood & Music
- Chat naturally — the AI detects your mood from conversation
- Generates a playlist matched to your energy, valence, and tempo
- Request specific songs directly in chat ("play X by Y")
- Custom in-app Mini-Player (no redirects to Spotify)
  - **Free users** — 30-second preview autoplay queue
  - **Premium users** — Full playback, seek, skip, and volume controls
- Spotify OAuth required for both login and music access

### 📚 Study Tools
- **Pomodoro Timer** — 25/5 focus cycles with automatic playlist launching
- **Flashcards** — AI evaluates your open-ended answers instead of simple card flipping
- **Spaced Repetition (SM-2)** — Schedules reviews around your exam date so nothing slips through
- **AI Study Planner** — Builds an adaptive plan based on your deadlines and availability

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + Shadcn/UI + Framer Motion |
| API | tRPC |
| AI | Vercel AI SDK + Groq |
| Database | Turso (SQLite) via Drizzle ORM |
| Auth | Better Auth (Spotify OAuth) |
| Music | Spotify Web API + Web Playback SDK |

**AI Models:**
- `meta-llama/llama-4-scout-17b` — mood detection, chat, flashcard generation
- `qwen/qwen3-32b` — flashcard answer evaluation (reasoning model)

---

## How It Works

**Mood Detection**
Every message is classified before anything else. If you're expressing a mood, it maps to Spotify audio attributes (energy, valence, tempo) and pulls songs accordingly. If you're asking for a specific track, it searches Spotify directly. General conversation gets a conversational reply — no unnecessary API calls.

**Flashcards**
Upload a PDF or paste notes, and Aurafy generates a deck. During review, you type your answer freely and the AI scores your understanding on a 0–5 scale — not just whether the wording matched.

**Spaced Repetition**
Built on SM-2. Set an exam date when creating a deck and the algorithm caps review intervals so every card surfaces before the deadline.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Turso database
- Spotify Developer account (`streaming`, `user-read-playback-state`, `user-modify-playback-state` scopes)
- Groq API key

### Setup

```bash
git clone https://github.com/yourusername/aurafy.git
cd aurafy
npm install
cp .env.example .env.local
```

### Environment Variables

```env
DATABASE_URL=your_turso_connection_string
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

### Database & Dev Server

```bash
npx drizzle-kit push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

- [ ] Spotify OAuth + mood chat + playlist generation
- [ ] Mini-Player (Free preview / Premium full playback)
- [ ] Rate limiting + Spotify result caching
- [ ] Pomodoro timer with playlist integration
- [ ] Flashcards with AI evaluation + SM-2 spaced repetition
- [ ] AI study planner
- [ ] Weekly mood & study recap
- [ ] Mobile responsive + PWA support
- [ ] Mind mapping tool
- [ ] Cornell note-taking template

---

## License

MIT — see [LICENSE](./LICENSE) for details.
