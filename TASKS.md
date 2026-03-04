# Aurafy Chat Upgrade — Task Plan

## Summary

The current chat system uses a **tRPC mutation** (`chat.sendMessage`) with manual React state management (`useState` for messages, `useRef` for abort controller). Messages are sent as a batch, the server processes them with `generateText`, and the full response is returned at once — **no streaming**.

This plan upgrades the chat to:

1. **Use AI SDK's `useChat` hook** — real-time streaming, managed state, built-in stop/retry/error handling.
2. **Add DB-backed chat memory** — persist conversations per user in libSQL so context survives page refreshes and sessions.
3. **Keep intent detection** (mood/song) working alongside the new streaming flow.

---

## Current Architecture

```
Client (conversation.tsx)
  ├── useState for message input
  ├── useState for history (ChatMessage[])
  ├── useRef for AbortController
  └── tRPC mutation: chat.sendMessage
        │
        ▼
Server (mutation.ts — processMessage)
  ├── 1. Classify intent (generateText → structured output)
  ├── 2a. If play_mood → detect mood → return { type, mood }
  ├── 2b. If play_song → return { type, songTitle, artist }
  └── 2c. If other → generateText (conversational) → return { type, text }
```

**Problems:**

- No streaming — user waits for full response before seeing anything
- No persistence — refresh the page and all messages are gone
- Manual state management — abort logic, error handling, loading states all hand-rolled
- `previousMessages` sent from client on every request (grows unbounded, no truncation)

---

## Target Architecture

```
Client (conversation.tsx)
  ├── useChat hook (manages messages, status, stop, error, regenerate)
  └── Sends to: POST /api/chat
        │
        ▼
Server (app/api/chat/route.ts)
  ├── 1. Auth check (validate session via Better Auth)
  ├── 2. Load recent messages from DB (chat_message table)
  ├── 3. Classify intent (generateText → structured output)
  │     ├── play_mood → detect mood → return structured JSON (non-streaming)
  │     └── play_song → return structured JSON (non-streaming)
  ├── 4. If conversational → streamText with DB history as context
  ├── 5. Save user message + assistant response to DB
  └── 6. Return stream or JSON to client
```

---

## Tasks

### Phase 1: Database Memory Layer

#### Task 1.1 — Create `chat_message` schema

> **File:** `src/server/db/schema/chat.ts`

Create a new Drizzle table for persisting chat messages:

| Column      | Type                  | Notes                                    |
| ----------- | --------------------- | ---------------------------------------- |
| `id`        | `text` (PK)           | UUID via `crypto.randomUUID()`           |
| `userId`    | `text` (FK → user.id) | Index this column                        |
| `role`      | `text`                | `"user"` or `"assistant"`                |
| `content`   | `text`                | The message body                         |
| `metadata`  | `text` (nullable)     | JSON string for mood/song/intent data    |
| `createdAt` | `integer` (timestamp) | `default(sql\`(unixepoch())\`)`          |

- Add an index on `userId` for fast lookups.
- Reference `user.id` with `onDelete: "cascade"`.

#### Task 1.2 — Export from schema index

> **File:** `src/server/db/schema/index.ts`

- Export `chatMessage` table from the new schema file.
- Add `chatMessageRelations` to `relations.ts` (belongs to `user`).

#### Task 1.3 — Add relation to user

> **File:** `src/server/db/schema/relations.ts`

- Add `chatMessages: many(chatMessage)` to `userRelations`.
- Add `chatMessageRelations` (one → user).

#### Task 1.4 — Push schema

```sh
pnpm db:push
```

#### Task 1.5 — Create memory helper functions

> **File:** `src/lib/api/chat/memory.ts`

```ts
// Load the last N messages for a user (chronological order)
export async function loadChatHistory(userId: string, limit?: number): Promise<...>

// Save a user + assistant message pair
export async function saveChatExchange(userId: string, userMsg: string, assistantMsg: string, metadata?: Record<string, unknown>): Promise<void>

// Optional: clear chat history for a user
export async function clearChatHistory(userId: string): Promise<void>
```

- Default `limit` to **30** messages (keeps context window manageable).
- Query ordered by `createdAt ASC` (oldest first) so messages are in conversation order.

---

### Phase 2: Streaming API Route with `useChat`

#### Task 2.1 — Install `@ai-sdk/react`

```sh
pnpm add @ai-sdk/react
```

> **Note:** You already have `ai` v6 and `@ai-sdk/groq` installed — those are compatible.

#### Task 2.2 — Create the streaming route

> **File:** `src/app/api/chat/route.ts`

```ts
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { groq } from "@/lib/groq";
import { MODELS } from "@/lib/models";
import { CONVERSATIONAL_SYSTEM_PROMPT } from "@/lib/prompt";
import { loadChatHistory, saveChatExchange } from "@/lib/api/chat/memory";
// + auth check helper

export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Authenticate — get userId from session
  // 2. Parse request body (messages from useChat)
  // 3. Load DB history for additional context
  // 4. Run intent classification on the latest user message
  //    - If play_mood or play_song → return JSON response (not streamed)
  //    - See Task 2.4 for handling this
  // 5. If conversational → streamText with system prompt + DB history + current messages
  // 6. Save exchange to DB (use onFinish callback of streamText)
  // 7. Return result.toUIMessageStreamResponse()
}
```

**Key decisions:**

- Use `streamText` (not `generateText`) for conversational responses.
- Use `onFinish` callback in `streamText` to save messages to DB after stream completes.
- For intent-based responses (mood/song), return a regular `Response` with JSON — `useChat` can handle non-streaming responses too via `onData` or custom handling.

#### Task 2.3 — Auth helper for route handlers

> **File:** `src/lib/api/auth.ts` (or inline in route)

Since this is a Next.js route handler (not tRPC), you need to validate the session manually:

```ts
import { auth } from "@/server/better-auth";

export async function getRequiredSession(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}
```

#### Task 2.4 — Handle intent detection in the streaming route

The intent classification (`play_mood`, `play_song`) needs structured data returned to the client — not a plain text stream. Two approaches:

**Option A — Use `streamText` data parts (recommended):**

```ts
// In the route, after detecting intent:
if (intent === "play_mood") {
  // Return a UIMessageStream with a data part containing mood info
  return createUIMessageStreamResponse({
    // send structured data alongside the text stream
  });
}
```

**Option B — Separate tRPC endpoint for intent actions:**

Keep the existing tRPC `chat.sendMessage` for intent detection only. The client calls tRPC first to check intent, and if it's conversational, falls through to `useChat`. This is simpler to implement initially.

> **Recommendation:** Start with **Option B** for speed, migrate to **Option A** later.

---

### Phase 3: Frontend Migration to `useChat`

#### Task 3.1 — Refactor `conversation.tsx`

> **File:** `src/app/(app)/home/_components/conversation.tsx`

Replace the entire manual state management with `useChat`:

**Remove:**

- `useState` for `message` and `history`
- `useRef` for `AbortController`
- Manual `handleAbort` / `handleSendMessage` logic
- tRPC `sendMessage` mutation (for conversational flow)

**Add:**

```ts
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const { messages, sendMessage, status, stop, error, regenerate } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
  }),
});
const [input, setInput] = useState("");
```

**What you get for free:**

| Feature                | Before (manual)                 | After (useChat)        |
| ---------------------- | ------------------------------- | ---------------------- |
| Message state          | `useState<ChatMessage[]>`       | `messages` from hook   |
| Loading state          | `isPending` from tRPC           | `status` field         |
| Streaming              | ❌ None                         | ✅ Real-time tokens    |
| Cancel/Stop            | Manual `AbortController`        | `stop()` function      |
| Retry last message     | ❌ Not implemented              | `regenerate()` method  |
| Error handling         | Manual try/catch                | `error` state          |
| Scroll / auto-updates  | Manual                          | Automatic re-renders   |

#### Task 3.2 — Render messages using `parts`

The `useChat` messages use a `parts` array instead of a flat `content` string:

```tsx
{messages.map((msg) => (
  <div key={msg.id}>
    {msg.parts.map((part, i) =>
      part.type === "text" ? <span key={i}>{part.text}</span> : null
    )}
  </div>
))}
```

#### Task 3.3 — Handle intent actions on the client

If using **Option B** (separate tRPC for intent):

```ts
const handleSend = async () => {
  // 1. Call tRPC to classify intent
  const intentResult = await classifyIntent({ message: input });

  if (intentResult.type === "play_mood") {
    // Handle Spotify mood action
    handleSpotifyAction(intentResult);
    // Optionally add to useChat messages via setMessages
    return;
  }

  if (intentResult.type === "play_song") {
    handleSpotifyAction(intentResult);
    return;
  }

  // 2. If conversational, let useChat handle it
  sendMessage({ text: input });
  setInput("");
};
```

#### Task 3.4 — Separate the tRPC intent-only endpoint

> **File:** `src/server/api/routers/chat.ts`

Refactor the existing router to have an intent-only procedure:

```ts
export const chatRouter = createTRPCRouter({
  classifyIntent: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      // Only runs intent classification + mood detection
      // Returns: { type: "play_mood", mood } | { type: "play_song", ... } | { type: "other" }
    }),
});
```

---

### Phase 4: Cleanup & Polish

#### Task 4.1 — Remove unused code

- Remove `previousMessages` from `chatFormSchema` (no longer sent from client).
- Remove old `processMessage` function (replaced by route + intent classifier).
- Remove `ChatForm` type if no longer used.

#### Task 4.2 — Add chat history clear button

Add a "New Chat" or "Clear History" button that:

1. Calls `clearChatHistory(userId)` on the server.
2. Calls `setMessages([])` on the client.

#### Task 4.3 — Update system prompt with memory context

> **File:** `src/lib/prompt.ts`

Optionally enhance the system prompt to mention the user's history:

```ts
export const CONVERSATIONAL_SYSTEM_PROMPT_WITH_MEMORY = (recentTopics: string) => `
You are Aurafy, a friendly mood and music assistant.
You help users discover music based on how they feel and support them with study tools.
Keep all replies short, casual, and conversational — 1 to 2 sentences only.

You have context from previous conversations with this user:
${recentTopics}
`;
```

#### Task 4.4 — Add message limit / truncation

In the streaming route, ensure you don't exceed the model's context window:

- Load at most **30** recent DB messages.
- Combined with current `useChat` messages, cap total at a reasonable limit.
- Groq's Llama 4 Scout supports 131K context, so 30 messages is very safe.

---

## File Changes Summary

| File                                            | Action | Description                                   |
| ----------------------------------------------- | ------ | --------------------------------------------- |
| `src/server/db/schema/chat.ts`                  | CREATE | `chatMessage` table definition                |
| `src/server/db/schema/index.ts`                 | EDIT   | Export `chatMessage`                          |
| `src/server/db/schema/relations.ts`             | EDIT   | Add `chatMessageRelations`, update `userRelations` |
| `src/lib/api/chat/memory.ts`                    | CREATE | `loadChatHistory`, `saveChatExchange`, `clearChatHistory` |
| `src/app/api/chat/route.ts`                     | CREATE | Streaming POST route for `useChat`            |
| `src/lib/api/auth.ts`                           | CREATE | Session validation helper for route handlers  |
| `src/app/(app)/home/_components/conversation.tsx`| EDIT   | Migrate to `useChat` hook                     |
| `src/server/api/routers/chat.ts`                | EDIT   | Refactor to intent-only `classifyIntent`      |
| `src/lib/api/chat/mutation.ts`                  | DELETE | Replaced by route + memory helpers            |
| `src/types/schema.ts`                           | EDIT   | Remove `previousMessages` from `chatFormSchema` |
| `src/lib/prompt.ts`                             | EDIT   | Optional: add memory-aware system prompt      |

## Dependencies

```sh
pnpm add @ai-sdk/react
```

> `ai` (v6) and `@ai-sdk/groq` are already installed — no other new deps needed.
> DB memory uses your existing Drizzle + libSQL setup — no external memory service required.

---

## Suggested Implementation Order

```
Phase 1 (DB Memory)
  1.1 → 1.2 → 1.3 → 1.4 → 1.5
       ↓
Phase 2 (Streaming Route)
  2.1 → 2.3 → 2.2 → 2.4
       ↓
Phase 3 (Frontend)
  3.1 → 3.2 → 3.4 → 3.3
       ↓
Phase 4 (Cleanup)
  4.1 → 4.2 → 4.3 → 4.4
```

**Estimated effort:** ~2-3 hours for a working implementation.