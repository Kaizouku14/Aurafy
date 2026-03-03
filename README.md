# 🎧 Aurafy — Mood-to-Playlist & Study App

> Chat with an AI about your day, get a personalized Spotify playlist, and study smarter with built-in focus tools.

---

## 📖 Overview

Aurafy is a full-stack web application that combines **AI-powered mood detection**,
**Spotify playlist generation**, and **study productivity tools** into one cohesive experience.

Users describe how they're feeling in natural language, the AI infers their mood, generates a matching song list, and helps them stay productive using focus and study tools — all in one app.

---

## ✨ Features

### 🎵 Mood-to-Playlist & Playback
- Ultra-low latency chat powered by **Groq** via the **Vercel AI SDK**
- Deterministic mood → Spotify audio attribute mapping (energy, valence, tempo)
- Song list generated based on detected mood + user listening history preferences
- **Song search via chat** — users can say "play me X by Y" and Aurafy searches Spotify and plays it immediately
- Adaptive in-app playback via a **custom Mini-Player modal** (no redirects to Spotify):
  - **Premium Users** — Full song autoplay queue, seek, skip, and volume controls
  - **Free Users** — Same Mini-Player UI with 30-second preview autoplay queue + "Open in Spotify" button per track
- **Spotify OAuth is required** to use Aurafy — used for both authentication and music playback
- Mood and playlist history per session

---

### 📚 Study Tools
- **Pomodoro Timer** — 25 / 5 focus cycles with automatic playlist launching
- **Active Recall Flashcards** — Open-ended answers evaluated by AI
- **Spaced Repetition (SM-2)** — Exam-date-aware scheduling
- **AI Study Planner** — Generates adaptive study plans based on deadlines and availability

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Animations | Framer Motion |
| API Layer | tRPC |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/groq`) |
| LLM Provider | Groq |
| Models | See model strategy below |
| ORM | Drizzle ORM |
| Database | Turso (SQLite) |
| Auth | Better Auth (Spotify OAuth) |
| Music API | Spotify Web API + Web Playback SDK |
| File Parsing | pdf-parse |
| Deployment | Vercel |

---

## 🤖 AI Model Strategy

Models are defined as constants for maintainability:

```ts
// lib/models.ts
export const MODELS = {
  mood: "meta-llama/llama-4-scout-17b-16e-instruct",       // mood detection + chat intent
  flashcards: "meta-llama/llama-4-scout-17b-16e-instruct", // flashcard generation from text/PDF
  evaluation: "qwen/qwen3-32b",                            // flashcard answer evaluation (reasoning)
} as const;
```

| Use Case | Model | Reason |
|---|---|---|
| Mood detection | `meta-llama/llama-4-scout-17b-16e-instruct` | Fast, structured JSON output, function calling support |
| Flashcard generation | `meta-llama/llama-4-scout-17b-16e-instruct` | Fast, reliable structured JSON output |
| Answer evaluation | `qwen/qwen3-32b` | Reasoning model — evaluates conceptual understanding accurately |

### Vercel AI SDK Usage Per Feature

| Feature | SDK Function |
|---|---|
| Mood detection | `generateObject` (Zod-validated) |
| Chat intent detection | `generateObject` (Zod-validated) |
| Chat streaming | `streamText` |
| Flashcard generation | `generateObject` (Zod-validated) |
| Answer evaluation | `generateText` |

---

## 🤖 Mood Detection

Aurafy detects mood through **natural conversation** rather than predefined inputs.

The AI analyzes user messages and uses `generateObject` with a Zod schema for safe, typed output.

### Example Output

```json
{
  "mood": "calm",
  "energy": 0.3,
  "valence": 0.6,
  "confidence": 0.85
}
```

### Mood → Music Mapping

| Mood | Energy | Valence | Genre Suggestion |
|---|---|---|---|
| Happy | 0.8 | 0.9 | Pop, Dance |
| Calm | 0.3 | 0.6 | Lo-fi, Ambient |
| Sad | 0.2 | 0.2 | Acoustic, Indie |
| Energetic | 0.9 | 0.7 | Hip-hop, EDM |
| Stressed | 0.6 | 0.3 | Classical, Jazz |
| Focused | 0.4 | 0.5 | Instrumental, Lo-fi |

---

## 🎵 Playback Architecture

### Authentication
Spotify OAuth is required to use Aurafy. It serves dual purposes:
- **Identity** — user authentication via Better Auth
- **Music** — access token for Spotify API and Web Playback SDK

### Chat Intent Detection

Every user message is first classified before triggering any API calls:

```ts
const { object } = await generateObject({
  model: groq(MODELS.mood),
  schema: z.object({
    intent: z.enum(["play_song", "play_mood", "other"]),
    songTitle: z.string().optional(),
    artist: z.string().optional(),
  }),
  prompt: `Extract intent and song info from: "${userMessage}"`,
});
```

| User Says | Intent | Action |
|---|---|---|
| "I feel calm today" | `play_mood` | Detect mood → generate song list |
| "Play me X by Y" | `play_song` | Search Spotify → play immediately |
| "I'm stressed, play some jazz" | `play_mood` | Detect mood → generate song list |
| General conversation | `other` | Reply conversationally — no Spotify call |

### Song List Generation
Songs are fetched based on detected mood + user preferences (derived from playlist history):

```
Mood detected
    ↓
Select seeds from mood-matching playlist history (max 5 total seeds)
    ↓
Fetch tracks via Spotify search or recommendations endpoint
    ↓
Display song list in UI
    ↓
User hits play → Mini-Player modal opens
```

### Tiered Playback

| Feature | Free User | Premium User |
|---|---|---|
| See song list | ✅ Yes | ✅ Yes |
| Mini-Player modal | ✅ Yes | ✅ Yes |
| Autoplay queue | ✅ 30s previews | ✅ Full songs |
| Seek / scrub | ❌ No | ✅ Yes |
| Skip tracks | ✅ Yes | ✅ Yes |
| Volume control | ✅ Yes | ✅ Yes |
| "Open in Spotify" button | ✅ Yes | ✅ Yes |

### Implementation

```ts
// Free users — plain <audio> tag with preview_url
const audio = new Audio(track.preview_url);

// Premium users — Spotify Web Playback SDK
const player = new window.Spotify.Player({
  name: "Aurafy Player",
  getOAuthToken: (cb) => cb(accessToken),
});
```

The Mini-Player UI is **fully custom** (Tailwind + Shadcn) for both user types — no Spotify embeds.

---

## 🛡️ Rate Limiting Strategy

To prevent excessive API calls to Groq and Spotify, Aurafy uses a layered approach:

### 1. Intent Detection Before Spotify Calls
Only call Spotify if the AI confirms a music-related intent — cuts unnecessary API calls significantly:

```ts
if (object.intent === "other") {
  return replyConversationally(); // No Spotify call
}
// Only reaches here for play_song or play_mood
```

### 2. Confidence Threshold for Mood Detection
Skip playlist generation if the AI isn't confident enough:

```ts
if (object.confidence < 0.6) {
  return replyConversationally(); // Don't generate playlist
}
generatePlaylist(object.mood);
```

### 3. Cache Spotify Search Results in Turso
Same query never hits the Spotify API twice:

```ts
// Check DB cache first
const cached = await db.query.spotifyCache.findFirst({
  where: eq(spotifyCache.query, searchQuery),
});

if (cached) return cached.trackData;

// Cache miss — call Spotify and store result
const result = await spotify.searchTracks(searchQuery);
await db.insert(spotifyCache).values({ query: searchQuery, trackData: result });
```

### 4. Per-User Rate Limiting in tRPC Middleware
Prevent a single user from spamming requests:

```ts
function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const timestamps = rateLimiter.get(userId) ?? [];
  const recent = timestamps.filter(t => now - t < windowMs);

  if (recent.length >= maxRequests) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Slow down — too many requests",
    });
  }

  rateLimiter.set(userId, [...recent, now]);
}
```

### Summary

| Strategy | Priority |
|---|---|
| Intent detection before Spotify calls | ✅ Must have |
| Confidence threshold for mood detection | ✅ Must have |
| Cache Spotify search results in Turso | ✅ Must have |
| Per-user rate limiting in tRPC middleware | ✅ Must have |

---

## 🧠 Spaced Repetition (SM-2)

Aurafy uses the **SM-2 algorithm** to schedule flashcard reviews. When creating a deck, users provide an **exam date** — the system dynamically calculates days remaining and caps review intervals so every card surfaces before the deadline.

### Deck Creation Flow

```
User creates deck → Enters subject + exam date
 ↓
daysUntilExam calculated dynamically on each review
 ↓
SM-2 interval = Math.min(computed interval, daysUntilExam)
 ↓
No card ever scheduled past the exam date
```

### `flashcard_decks` Schema (relevant fields)

```ts
{
  id: uuid,
  userId: uuid,
  subject: string,
  examDate: date,       // used to cap SM-2 intervals
  createdAt: timestamp,
}
```

---

## 🃏 Active Recall Flashcards

Aurafy uses **AI-evaluated open-ended answers** rather than simple card flipping. This forces genuine retrieval and removes self-rating bias.

### Card Creation

Users can populate a deck in two ways:

```
Option A — Upload a file (PDF)
  ↓
Text extracted on the server (pdf-parse)
  ↓
Sent to Groq → returns structured flashcard JSON

Option B — Paste text directly
  ↓
Text sent to Groq → returns structured flashcard JSON
```

Both methods produce the same output — a list of `{ front, back }` cards saved to the `flashcards` table under the deck.

### Groq Prompt (Flashcard Generation)

```ts
const prompt = `
You are a flashcard generator. Given the following study notes, generate ${count} flashcards.
Return ONLY a JSON array. No explanation, no markdown.

Format:
[{ "front": "question", "back": "answer" }, ...]

Notes:
${extractedText}
`
```

### Review Flow

```
User sees card front (question)
 ↓
User types their answer freely
 ↓
Groq evaluates answer vs. correct back of card
 ↓
Returns quality score (0–5)
 ↓
SM-2 uses score to schedule next review date
```

### Scoring Rubric

| Score | Meaning |
|---|---|
| 5 | Perfect response |
| 4 | Correct with minor hesitation |
| 3 | Correct but required effort |
| 2 | Incorrect but answer felt familiar |
| 1 | Incorrect, answer was hard |
| 0 | Complete blackout |

The AI accepts rephrased or partially correct answers gracefully — it evaluates **understanding**, not exact wording.

---

## 🗄️ Database Schema

### Core Tables

- **users** — user accounts managed by Better Auth (Spotify OAuth)
- **user_preferences** — stores favorite genres and playlist history for mood-based seed selection
- **mood_sessions** — stores chat history and detected mood JSON per session
- **playlists** — stores generated song lists tied to a mood session
- **spotify_cache** — caches Spotify search results to reduce redundant API calls
- **flashcard_decks** — groups of flashcards per subject, includes `examDate` for SM-2 interval capping
- **flashcards** — individual cards with front, back, and SM-2 scheduling fields
- **pomodoro_sessions** — logs completed Pomodoro sessions with linked playlist

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Turso SQLite database
- Spotify Developer account (OAuth app with `streaming`, `user-read-playback-state`, `user-modify-playback-state` scopes)
- Groq API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aurafy.git
cd aurafy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Database
DATABASE_URL=your_turso_sqlite_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Groq
GROQ_API_KEY=your_groq_api_key

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

### Database Setup

```bash
# Push schema to database
npx drizzle-kit push

# Or generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔮 Roadmap

- [ ] Spotify OAuth — authentication + music access
- [ ] Core mood chat + song list generation
- [ ] Chat intent detection (mood vs song request vs general)
- [ ] Custom Mini-Player modal (Free: 30s previews, Premium: full playback)
- [ ] Rate limiting — intent gating, confidence threshold, Spotify cache, per-user limits
- [ ] Pomodoro timer with playlist integration
- [ ] Active Recall flashcard system with AI answer evaluation
- [ ] Flashcard generation from uploaded files (PDF, DOCX, TXT) or pasted text
- [ ] Spaced Repetition scheduling (SM-2) with exam-date-aware intervals
- [ ] AI study planner
- [ ] Weekly mood and study recap
- [ ] Mobile responsive design
- [ ] PWA support
- [ ] Mind Mapping tool
- [ ] Cornell Note-taking template

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
