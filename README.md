# Maid Daily Tasks App

A mobile-friendly web app for tracking your maid's daily tasks. When she taps a task as done, you instantly receive a Telegram notification.

## Features

- **Maid view** — shows today's tasks, tap to check them off
- **Owner view** — PIN-protected panel to add/edit/delete tasks and see today's progress
- **Real-time sync** — both screens update instantly via Firebase
- **Telegram notification** — you're notified the moment a task is completed

---

## Setup Guide

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Set up Firebase

1. Go to https://console.firebase.google.com and create a new project
2. Click **Firestore Database** → **Create database** → choose **Start in test mode**
3. Click **Project Settings** (gear icon) → scroll to **Your apps** → click **</>** (Web)
4. Register the app, then copy the `firebaseConfig` values
5. Copy `.env.example` to `.env` and paste in your Firebase values

### Step 3 — Set up Telegram notifications

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`, follow the prompts, and copy the **bot token**
3. Start a chat with your new bot, then visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Send any message to the bot, refresh that URL, and find your **chat id** in the response
5. Add both values to your `.env` file

### Step 4 — Configure your PIN

In `.env`, set `VITE_ADMIN_PIN` to whatever PIN you want (default is `1234`).

### Step 5 — Run locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Deploy (so your maid can access it from her phone)

The easiest option is **Vercel**:

1. Push this repo to GitHub
2. Go to https://vercel.com and import the repo
3. Add all your `.env` variables in the Vercel dashboard under **Environment Variables**
4. Deploy — Vercel gives you a public URL to share with your maid

---

## How to use

- **Maid opens the app** → sees today's task list → taps tasks to mark them done → you get a Telegram message for each one
- **You tap the gear icon (⚙️)** → enter your PIN → add/edit tasks and choose which days they appear
