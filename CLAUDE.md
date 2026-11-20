# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PomoTime (pomotime.io): a Pomodoro timer with task management. Next.js 14 App Router, React 18, TypeScript, Tailwind, shadcn/ui (Radix), Supabase (auth + Postgres + realtime), deployed on Vercel.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also runs type checking)
npm run lint    # next lint (next/core-web-vitals + next/typescript)
```

There is no test suite.

Required env vars (no `.env` is committed; `lib/supabase.ts` throws at import if they are missing):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Architecture

**Client-side app on top of a single Supabase client.** Nearly everything is a `'use client'` component. All data access goes straight from the browser to Supabase through the singleton in `lib/supabase.ts`. There are no API routes or server actions. The Supabase tables used are `workspaces`, `tasks` and `timer_settings` (the schema lives in Supabase, not in this repo, so row-level security has to be enforced there).

**Global layout and providers** (`app/layout.tsx`): every page renders inside `AuthProvider → TimerProvider → WorkspaceProvider → GlobalLoader`, with a persistent `Sidebar`, the page content in `<main>`, and a persistent `TaskPanel` on the right. Because the timer and task panel sit in the layout, they keep their state across route changes.

**State lives in contexts, not pages:**
- `contexts/auth-context.tsx`: wraps Supabase auth (email/password and OAuth). It also mirrors the session into the `access_token` and `last_activity` cookies (js-cookie) and runs inactivity and token-refresh timers. Timeouts and cookie names come from `lib/security-constants.ts`.
- `contexts/workspace-context.tsx`: owns workspaces and tasks, with the CRUD functions, drag-and-drop ordering (`updateTaskOrder`) and a realtime `postgres_changes` subscription that refetches tasks on any change. It fetches the tasks for *all* of the user's workspaces at once, so filter by `workspace_id` when you need one workspace. `createWorkspace` limits each user to 2 workspaces and shows `WorkspaceLimitModal` when they hit the limit.
- `contexts/timer-context.tsx` is a thin wrapper that exposes `hooks/use-timer.ts`. The hook holds the timer logic: the focus/shortBreak/longBreak modes, timing based on `requestAnimationFrame`/`performance.now()` with visibility-change handling, sounds from `public/sounds/`, and per-user settings loaded from `timer_settings`. Those settings are stored in **minutes** in the database and in **seconds** in memory.

**Guest mode vs. signed-in mode:** every task operation in `workspace-context` branches on `user`. Signed-out users get tasks kept only in `localStorage` (`local_tasks`) with `workspace_id: ''` and IDs from `crypto.randomUUID()`. Signed-in users get tasks in Supabase. Any new task feature needs to handle both paths.

**Task ordering:** tasks carry a numeric `order`. New tasks get `max(order) + 1000`, which leaves gaps for reordering. Reordering with @dnd-kit upserts the new `order` values.

**Route protection** (`middleware.ts`): checks the `access_token`/`last_activity` cookies, not the Supabase session itself. Any route that isn't in `publicPaths` redirects to `/` when the user isn't authenticated, and `/profile` is explicitly forced to require auth even though it appears in the list. When you add a public page, add it to `publicPaths` and to `public/sitemap.xml`.

## Conventions

- Import alias `@/*` maps to the repo root.
- shadcn/ui primitives live in `components/ui/` (configured in `components.json`, using lucide icons). Add new primitives with the shadcn CLI rather than writing them by hand.
- Type definitions are partly duplicated: `lib/types.ts` defines `Task`/`Workspace`/`WorkspaceContextType`, but `workspace-context.tsx` declares its own, more complete `WorkspaceContextType` (including `updateTaskOrder`).
- `instructions.md` holds an outdated file tree, and `contexts/session-context.tsx` is empty. Don't treat either as authoritative.
