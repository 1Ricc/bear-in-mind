# ESG Coach Chatbot — Design Spec

**Date:** 2026-05-13  
**Status:** Approved

---

## Overview

Add a floating ESG coach chatbot to the app, powered by the Claude API. The chatbot is personalized: it receives the user's current points, CO₂ savings, recent activities, and team ranking as context, and uses that to give specific, encouraging ESG advice. It appears as a green bubble fixed to the bottom-right corner of every page.

---

## Architecture

```
ChatBot.vue (frontend)
    │
    │  POST /api/chat
    │  { message: string, history: [{role, content}][] }
    │  Authorization: Bearer <jwt>
    ▼
routes/chat.js (Express)
    │
    ├──► SQLite DB  (fetch user's points, co2, team, recent activities)
    │
    └──► Claude API  (claude-haiku-4-5, system prompt + messages[])
             │
             ▼
         { reply: string }  ──► ChatBot.vue
```

The backend owns all Claude API calls. The API key never reaches the browser.

---

## Backend

### New file: `server/routes/chat.js`

**Route:** `POST /api/chat`  
**Auth:** requires JWT (`authenticateToken` middleware, same as all other routes)

**Request body:**
```json
{
  "message": "How can I earn more points?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hi! I'm your ESG coach..." }
  ]
}
```

**Response:**
```json
{ "reply": "Try logging public transport this week — saves 10 kg CO₂ and 50 pts!", "remainingMessages": 18 }
```

**Error (rate limit):**
```json
{ "error": "Daily message limit reached. Try again tomorrow." }
```

### Rate limiting (three layers)

| Layer | Limit | Implementation |
|---|---|---|
| Per-user daily message cap | 20 messages/day | In-memory `Map<employee_id, {count, date}>`, resets at midnight |
| Input truncation | 500 characters max | Server-side slice before sending to Claude |
| History window | Last 6 messages (3 turns) | Slice `history` array before forwarding |
| Output cap | `max_tokens: 300` | Claude API parameter |

The in-memory map is sufficient for MVP — it resets on server restart, which is acceptable behaviour.

### System prompt

```
You are an ESG coach helping {first_name} improve their environmental impact.

Their current stats:
- Total CO₂ saved: {total_co2_saved_kg} kg
- Total points: {points_total}
- Team: {team_name} (ranked {team_rank} of {team_count})
- Recent activities: {last_3_activity_names}

Keep replies to 2-3 sentences. Be specific, encouraging, and practical.
Do not make up activities that don't exist in the app.
```

Context values are fetched fresh from the DB on every request, so they always reflect the user's current state.

### User context query

Fetches from `employees`, `teams`, and the last 3 `employee_activities` joined with `activities`. No new tables required.

Team rank is computed as position when all teams are ordered by `co2_reduction_kg` descending — consistent with how the rest of the app measures team progress.

### Wiring

Register in `server/index.js`:
```js
import chatRoutes from './routes/chat.js';
app.use('/api/chat', chatRoutes);
```

Add to `.env`:
```
ANTHROPIC_API_KEY=your_key_here
```

Install: `npm install @anthropic-ai/sdk`

---

## Frontend

### New file: `frontend/src/components/ChatBot.vue`

A self-contained component added once in `App.vue` (so it persists across route changes).

**Closed state:** A 48×48 px green circle with a 🌿 emoji, fixed `bottom: 24px; right: 24px`, z-index above everything.

**Open state:** A 320×420 px panel anchored to the bottom-right corner, with:
- Green header: "🌿 ESG Coach / Powered by Claude"
- Scrollable message list (user messages right-aligned green, assistant messages left-aligned grey)
- Daily message counter: "X / 20 messages today" above the input
- Text input + send button
- Loading state: animated "..." bubble while awaiting reply
- Error state: inline red text below the input if rate limit hit or API fails

**State (all local, no Pinia/Vuex):**
- `isOpen: boolean`
- `messages: [{role, content}]` — conversation history, lost on page refresh
- `input: string`
- `isLoading: boolean`
- `dailyCount: number` — updated from `remainingMessages` in each successful API response
- `error: string | null`

**API call:**
```js
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  },
  body: JSON.stringify({
    message: input,
    history: messages.slice(-6)
  })
});
```

### Wiring in `App.vue`

```vue
<template>
  <router-view />
  <ChatBot />
</template>
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Rate limit hit (server returns 429) | Inline error: "Daily limit reached. Try again tomorrow." |
| Claude API failure | Inline error: "Something went wrong. Please try again." |
| No JWT token | Request fails auth middleware; chatbot shows generic error |
| Empty message submitted | Send button disabled; no API call made |
| Message > 500 chars | Truncated server-side; user sees no change |

---

## What's Not In Scope

- Conversation persistence across sessions (no DB storage)
- Streaming responses
- Chat history export
- Admin visibility into conversations
- Push notifications from the coach

---

## Files Changed

| File | Change |
|---|---|
| `server/routes/chat.js` | New file — chat route |
| `server/index.js` | Register `/api/chat` route |
| `server/.env` | Add `ANTHROPIC_API_KEY` |
| `server/package.json` | Add `@anthropic-ai/sdk` |
| `frontend/src/components/ChatBot.vue` | New file — chatbot component |
| `frontend/src/App.vue` | Mount `<ChatBot />` |
