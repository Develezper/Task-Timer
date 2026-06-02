# Task Timer

Web app to create tasks, start them, complete them, and track the time spent on each one using MongoDB.

Live URL: `https://task-timer-delta-nine.vercel.app/`

## Features

- Create tasks with an initial `pending` status
- Start a task and update the timer every second
- Complete tasks while preserving the total tracked time
- Delete tasks
- Full persistence with MongoDB
- Responsive interface with reusable cards

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- MongoDB

## Run Locally

```bash
bun install
bun run dev
```

Before starting, create a `.env.local` file based on `.env.example`.

Open `http://localhost:3000`.

## Scripts

```bash
bun run dev
bun run lint
bun run build
```

## Main Structure

```text
src/
├── app/
├── components/
│   ├── Card.tsx
│   └── tasks/
├── types/
```

## Deployment

The project is ready to be deployed on Vercel by configuring `MONGODB_URI` and `MONGODB_DB`.
