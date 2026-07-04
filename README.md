# Household Tasks App

A mobile-friendly web app for managing your household staff's daily tasks. Any family can sign up, create their own household, and share a private link with their maid. When she taps a task as done, the owner instantly receives a Telegram notification.

## Features

- **Multi-household accounts** — every family gets its own private workspace (Firebase Auth, email + password)
- **Maid view via share link** — no account needed; opening the link on her phone shows her task list, and the phone remembers it
- **Owner dashboard** — add/edit/delete tasks, see today's progress and completion times
- **Real-time sync** — both screens update instantly via Firestore
- **Per-household Telegram notifications** — each owner connects their own bot in Settings

---

## Setup Guide

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Set up Firebase

1. Go to https://console.firebase.google.com and create a new project
2. Click **Firestore Database** → **Create database**
3. Click **Build → Authentication → Get started → Email/Password** and enable it
4. Open the **Rules** tab of Firestore and paste in the contents of `firestore.rules`, then publish
5. Click **Project Settings** (gear icon) → scroll to **Your apps** → click **</>** (Web)
6. Register the app, then copy the `firebaseConfig` values
7. Copy `.env.example` to `.env` and paste in your Firebase values

### Step 3 — Run locally

```bash
npm run dev
```

Open http://localhost:5173, create an account, and name your household.

### Step 4 — Telegram notifications (optional, per household)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`, follow the prompts, and copy the **bot token**
3. Start a chat with your new bot, then visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Send any message to the bot, refresh that URL, and find your **chat id** in the response
5. In the app, tap the gear icon (⚙️) and paste both values into **Settings**

---

## Deploy (so your maid can access it from her phone)

The easiest option is **Vercel**:

1. Push this repo to GitHub
2. Go to https://vercel.com and import the repo
3. Add your `.env` variables in the Vercel dashboard under **Environment Variables**
4. Deploy — Vercel gives you a public URL

---

## How to use

- **Owner:** sign up → name your household → add tasks → copy the **share link** from the dashboard and send it to your maid (privately — anyone with the link can view and check off tasks)
- **Maid:** opens the link → sees today's task list → taps tasks to mark them done → the owner gets a Telegram message for each one
- The maid's phone stays in staff mode after the first visit; the small "Owner sign in" link at the bottom exits it

## Security model (MVP)

The share link contains the household's random, unguessable ID — like a Google Docs "anyone with the link" share. Household IDs can't be listed or enumerated, task management requires the owner's login, but anyone who obtains the link can view tasks and mark them complete. Keep the link private, and treat this as an MVP trade-off to avoid requiring an account for the maid.

## Upgrading from the single-household version

Tasks now live under `households/<id>/tasks` instead of a top-level `tasks` collection, so tasks created with the old version won't appear. Re-add them from the owner dashboard (or move the documents in the Firebase console), and re-enter your Telegram bot token in Settings — it's no longer read from `.env`.
