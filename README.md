# 🎧 Aurafy

> **Your AI-Powered Music & Study Companion**
> Aurafy is a modern web application spanning the divide between productivity and relaxation. It seamlessly blends conversational AI, mood-based Spotify music discovery, and scientifically-proven study tools into one centralized, beautifully designed platform.

---

## ✨ Core Features

### 🎵 Intelligent Music Discovery & Player
- **Conversational Mood-to-Playlist:** Chat with the integrated Aurafy AI about your day. It analyzes your emotional tone, maps it to Spotify audio features (energy, valence), and generates a tailored playlist.
- **Direct Requests:** Tell the AI to "play Break Free by Ariana Grande" and it instantly queues the track. It even understands context like "play that song you just suggested."
- **Integrated Mini-Player:** A custom, floating Spotify Web Playback SDK player.
  - *Free users* enjoy continuous 30-second preview streams.
  - *Premium users* get full track playback, seeking, and volume controls without ever opening the Spotify app.

### 📚 Advanced Study Ecosystem
- **AI-Evaluated Flashcards:** Upload PDF lecture slides or paste notes. The AI automatically extracts core concepts into a flashcard deck. When reviewing, you type your answer freely—the **AI grades your conceptual understanding** using a reasoning model, rather than relying on rigid exact-word matching.
- **Exam-Aware Spaced Repetition:** Flashcard reviews are scheduled using the SM-2 algorithm, intelligently clamped to ensure all due cards are learned *before* your specified Exam Date.
- **AI Study Planner:** Input your subjects, upcoming exam dates, and daily available study hours. Aurafy's intelligence generates a realistic, day-by-day chronological study schedule.
- **Cornell Notes Workspace:** A dedicated digital notebook formatted specifically for the proven Cornell method (Cues, Notes, Summary).
- **Focus / Pomodoro Timer:** Built-in configurable focus cycles (e.g., 25 focus / 5 break). The timer **automatically links to your music**, pausing the Spotify player when a break starts and resuming it when focus time begins, accompanied by Web Audio API spatial chimes.

### 💻 Modern UI/UX
- **Sleek Dark Mode Aesthetics:** A heavily customized, asymmetric layout featuring vibrant red accents (`var(--main)`), stark contrast borders, and responsive split-pane designs.
- **Fully Mobile Responsive:** The complex dashboard gracefully collapses into scrollable, touch-friendly tabbed interfaces on mobile devices.
- **Fluid Navigation:** Integrated Next.js TopLoader for seamless page transition feedback.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Next.js 15 (App Router)** - React framework
- **Tailwind CSS + shadcn/ui** - Styling and accessible component primitives
- **Zustand** - Client-side state management (Spotify Player, Pomodoro)
- **Framer Motion** - Micro-animations and layout transitions

### Backend & Data
- **tRPC** - End-to-end typesafe APIs
- **Turso (SQLite) + Drizzle ORM** - Edge database and schema management
- **Better Auth** - Authentication handling standard sessions and Spotify OAuth tokens

### AI & Integrations
- **Vercel AI SDK** - Streaming UI capabilities and tool calling
- **Groq** - Blazing fast LLM inference (`llama-4-scout` for general chat/mood, `openai/gpt-oss-120b` for deep reasoning flashcard evaluation)
- **Spotify Web API & Web Playback SDK** - Music context, search, and audio streaming

---

## 🚀 Getting Started

### Prerequisites
1. **Node.js 18+** & **pnpm**
2. **Turso** database account
3. **Spotify Developer** account (App requires `streaming`, `user-read-playback-state`, `user-modify-playback-state`, `user-library-read` scopes)
4. **Groq** API key

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/aurafy.git
cd aurafy
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="libsql://your-db.turso.io"
DATABASE_AUTH_TOKEN="your-turso-token"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-random-secure-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Spotify
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
SPOTIFY_REDIRECT_URI="http://localhost:3000/api/auth/spotify/callback"

# AI
GROQ_API_KEY="your-groq-api-key"
```

### 3. Database Setup
Push the Drizzle schema to your Turso database:
```bash
pnpm db:push
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Log in using your Spotify account to authorize the player!

---

## 🗺️ Roadmap (Completed ✅)

- [x] Spotify OAuth + Mood Chat Intent Classification
- [x] Mini-Player (Free preview fallback & Premium Web Playback)
- [x] Background Token Refreshing mechanics
- [x] Pomodoro timer with Spotify auto-pause/play integration
- [x] Flashcards with AI comprehension grading + Exam-clamped SM-2 algorithm
- [x] PDF Upload & Text Parsing Pipeline
- [x] AI Study Planner chronological generation
- [x] Cornell note-taking workspaces
- [x] Mobile UI UX Refinements & TopLoader Layouts
- [ ] Mind mapping tool (Upcoming Phase)
- [ ] Weekly analytics dashboard (Upcoming Phase)

---

## 📄 License
This project is licensed under the MIT License.
