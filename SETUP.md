# Chat with Clara — setup guide

A daily, free English-conversation app for mum's iPhone. She taps a button, talks,
"Clara" (the AI) replies in a natural voice, gently fixes mistakes along the way, and a
notification nudges her once a day with a new real-life topic (ordering coffee, chatting
at the shops, asking for directions, etc.).

## What it's built from 

| Part | Tool | Cost |
|---|---|---|
| Speech → text (hearing her) | Groq (Whisper model), free tier | $0 |
| Conversation + corrections ("the brain") | Groq (Llama 3.3), free tier | $0 |
| Text → speech (Clara's voice) | iPhone's built-in voice (`expo-speech`) | $0 |
| Daily notification | Expo push notifications | $0 |
| App | Expo Go on her iPhone | $0 |
| Backend server | Your computer, or a free-tier host | $0 |

**built-in**
text-to-speech voice (the one Siri/VoiceOver uses), not a premium AI voice. It's a bit more
robotic than a paid option, but the conversation quality and corrections are just as good.

Also: she talks in **turns** (tap, speak a sentence or two, tap again, Clara replies) rather
than a live, both-talk-at-once phone call. That's a deliberate choice so it runs reliably in
Expo Go with zero extra setup — see "Wanting a live call instead" at the bottom if you want
to upgrade this later.

## Part 1 — Get a free Groq API key

1. Go to https://console.groq.com/keys and sign up (no credit card needed for the free tier).
2. Create an API key, copy it.
3. In `backend/.env` (copy `backend/.env.example` to `backend/.env` first), paste it in as `GROQ_API_KEY`.
4. Also set `JWT_SECRET` in that same file to any random long string (just mash the keyboard).

## Part 2 — Run the backend

This needs to be running whenever she wants to chat. Easiest for testing: run it on your own
laptop while it's on the same wifi as her phone.

```bash
cd backend
npm start
```

You should see `Backend listening on http://0.0.0.0:3000`.

Find your computer's local IP address (on Mac: System Settings → Wi-Fi → Details, or run
`ipconfig getifaddr en0` in Terminal). Open `app/src/api.js` and change `API_BASE_URL` to
`http://<your-computer's-IP>:3000`.

**For real daily use** (not just while testing on your wifi), deploy the backend somewhere
always-on and free, such as [Render](https://render.com) or [Railway](https://railway.app)
free tier — upload the `backend` folder, set the same two environment variables there, and
use the URL it gives you as `API_BASE_URL` instead.

## Part 3 — Run the app on her iPhone

1. On her iPhone, install the free **Expo Go** app from the App Store.
2. On your computer:
   ```bash
   cd app
   npm install
   npx expo start
   ```
3. A QR code appears in the terminal. On her iPhone, open the Camera app (or Expo Go itself)
   and scan it — it opens straight into the app, no App Store review needed.
4. First time: she'll create an account (just a name, email, password — stored only on your
   backend).

While developing, her phone needs to be on the **same wifi network** as your computer (because
of the local IP step above). Once you deploy the backend to Render/Railway instead, that
restriction goes away and she can use it on mobile data too.

## Day-to-day use

- She opens the app, sees today's topic, taps "Chat with Clara."
- She taps "Tap to talk," says something, taps again to send it.
- Clara replies out loud and as a chat bubble. If she made a mistake, Clara folds the
  correction naturally into her reply and asks her to repeat just that bit.
- A push notification arrives once a day (default 5pm, changeable in Settings) with that
  day's topic as a gentle nudge.

## Changing the topics or Clara's personality

- Topics live in `backend/topics.js` — add, remove, or reword any of the 15 scenarios there.
- Clara's personality and how she corrects mistakes is the instruction block in
  `backend/persona.js` — tune the tone, her name, how gently/directly she corrects, etc.

## Wanting a live, both-talk-at-once call instead of tap-to-talk

That needs a custom build (`expo-dev-client` + EAS Build) instead of plain Expo Go, because
continuous audio streaming needs a native module Expo Go doesn't include. It's still free,
still installs directly on her phone with no App Store review — just one extra one-time build
step. Ask me and I'll convert the app over to that approach.
