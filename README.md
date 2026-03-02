# 🎧 Aurafy — Mood-to-Playlist & Study App

> Chat with an AI about your day, get a personalized Spotify playlist, and study smarter with built-in focus tools.

---

## 📖 Overview

Aurafy is a full-stack web app that combines **AI-powered mood detection**, **Spotify playlist generation**, and **study productivity tools** into one cohesive experience. Tell the AI how you're feeling, get a playlist that matches your mood, and kick off a focused study session — all in one place.

---

## ✨ Features

### 🎵 Mood-to-Playlist
- Chat-based mood detection powered by Grok (xAI)
- AI infers emotional state and returns structured JSON output
- Deterministic mood → music attribute mapping
- Automatic Spotify playlist generation
- Mood and playlist history

### 📚 Study Tools
- **Pomodoro Timer** — 25 min work / 5 min break sessions with automatic playlist launching
- **Active Recall Flashcards** — See the front of a card, type your answer, and let the AI evaluate your response against the correct answer; scores feed directly into the SM-2 scheduler
- **Spaced Repetition** — SM-2 algorithm with exam-date-aware scheduling; intervals are automatically capped so no card slips past your deadline
- **AI Study Planner** — generates a study plan based on your subject, deadline, and available hours

### 🤖 AI Integrations
- Mood detection from natural conversation
- Real-time playlist energy adjustment based on mood shifts
- Flashcard generator from uploaded files (PDF, DOCX, TXT) or pasted text
- File text extraction via pdf-parse (PDF) and mammoth (DOCX)
- Open-ended flashcard answer evaluation
- Optimal Pomodoro session length suggestions based on current mood
- Weekly mood and study recap summaries

---

## 🏗️ Architecture

```
User
 ↓
Chat UI (Next.js)
 ↓
Vercel AI SDK
 ↓
Grok LLM (xAI)
 ↓
Mood JSON { mood, energy, valence, confidence }
 ↓
Mood → Music Attribute Mapping
 ↓
Spotify Web API
 ↓
Playlist Link 🎶
```

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Animations | Framer Motion |
| API Layer | tRPC |
| AI SDK | Vercel AI SDK |
| LLM | Grok via xAI |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| Database | PostgreSQL (via Supabase) |
| Music API | Spotify Web API |
| File Parsing | pdf-parse, mammoth |
| Deployment | Vercel |

---

## 🤖 Mood Detection

The AI is prompted to infer the user's mood from natural conversation and return **JSON only**.

### Example AI Output

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
Option A — Upload a file (PDF, DOCX, TXT)
  ↓
Text extracted on the server (pdf-parse / mammoth)
  ↓
Sent to Grok → returns structured flashcard JSON

Option B — Paste text directly
  ↓
Text sent to Grok → returns structured flashcard JSON
```

Both methods produce the same output — a list of `{ front, back }` cards saved to the `flashcards` table under the deck.

### Grok Prompt (Flashcard Generation)

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

### tRPC Router (Flashcard Generation)

```ts
generateFlashcards: protectedProcedure
  .input(z.object({
    deckId: z.string(),
    text: z.string(),   // extracted from file or pasted directly
    count: z.number().min(5).max(50).default(10),
  }))
  .mutation(async ({ ctx, input }) => {
    const completion = await grok.chat.completions.create({
      model: "grok-2",
      messages: [{ role: "user", content: buildPrompt(input.text, input.count) }],
    });

    const cards: { front: string; back: string }[] = JSON.parse(
      completion.choices[0].message.content ?? "[]"
    );

    await ctx.db.insert(flashcards).values(
      cards.map((card) => ({
        deckId: input.deckId,
        front: card.front,
        back: card.back,
      }))
    );

    return { count: cards.length };
  });
```

### Review Flow

```
User sees card front (question)
 ↓
User types their answer freely
 ↓
Grok evaluates answer vs. correct back of card
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

## 📁 Project Structure

```
aurafy/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── chat/          # Mood detection chat
│   │   ├── playlist/      # Playlist history
│   │   └── study/
│   │       ├── pomodoro/  # Pomodoro timer
│   │       ├── flashcards/# Active recall flashcards
│   │       └── schedule/  # Spaced repetition schedule
│   └── api/
│       └── trpc/
├── components/
│   ├── chat/
│   ├── playlist/
│   └── study/
├── server/
│   ├── api/
│   │   └── routers/
│   ├── auth/
│   └── db/
│       └── schema/        # Drizzle schema
├── lib/
│   ├── mood-mapping.ts    # Mood → music attributes
│   ├── spotify.ts         # Spotify API client
│   ├── sm2.ts             # Spaced repetition algorithm (exam-date aware)
│   └── file-parser.ts     # PDF, DOCX, TXT text extraction
└── drizzle.config.ts
```

---

## 🗄️ Database Schema

### Core Tables

- **users** — user accounts managed by Better Auth
- **mood_sessions** — stores chat history and detected mood JSON per session
- **playlists** — stores generated Spotify playlist links tied to a mood session
- **flashcard_decks** — groups of flashcards per subject, includes `examDate` for SM-2 interval capping
- **flashcards** — individual cards with front, back, and SM-2 scheduling fields
- **pomodoro_sessions** — logs completed Pomodoro sessions with linked playlist

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase free tier recommended)
- Spotify Developer account
- xAI API key (for Grok)

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
DATABASE_URL=your_supabase_postgres_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# xAI (Grok)
XAI_API_KEY=your_xai_api_key

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

- [ ] Core mood chat + Spotify playlist generation
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
