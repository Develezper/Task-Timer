# Task Timer

Web app to create tasks, start them, complete them, review a detail view, and keep a comment history per task using MongoDB.

Live URL: `https://task-timer-delta-nine.vercel.app/`

## Features

- Create tasks with an initial `pending` status
- Start a task and update the timer every second
- Complete tasks while preserving the total tracked time
- Delete tasks
- Navigate with `useRouter` to `/todolist/[id]` using the real MongoDB `_id`
- View task details with status, start date, finish date, and comment counter
- Add comments to each task and persist them in MongoDB
- Full persistence with MongoDB
- Service layer for tasks and comments
- Responsive interface with reusable cards

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- MongoDB
- Mongoose

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
│   ├── api/
│   └── todolist/[id]/page.tsx
├── components/
│   ├── Card.tsx
│   ├── comments/
│   └── tasks/
├── models/
├── services/
└── types/
```

## Architecture

The app follows this flow:

`views -> services -> API routes -> database`

- `src/services/tasks.ts` centralizes task requests from the UI
- `src/services/comments.ts` centralizes comment requests from the UI
- `src/app/api/*` contains route handlers for tasks, task detail, and comments
- `src/lib/task-repository.ts` keeps database access for task reads and writes
- `src/models/Comment.ts` defines the comment model in Mongoose

## Deployment

The project is ready to be deployed on Vercel by configuring `MONGODB_URI` and `MONGODB_DB`.
