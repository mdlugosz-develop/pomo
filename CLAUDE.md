# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PomoTime (pomotime.io): a Pomodoro timer with task management. It's built with Next.js 14 (App Router), React 18, TypeScript, Tailwind and shadcn/ui (Radix), and deployed on Vercel. There are no accounts and no backend: all user data lives in the browser's `localStorage`.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also runs type checking)
npm run lint    # next lint (next/core-web-vitals + next/typescript)
npx tsc --noEmit
```

There is no test suite, and no environment variables are required.

## Architecture

**Client-only app.** Nearly everything is a `'use client'` component. There are no API routes, server actions, database or middleware.

**Global layout and providers** (`app/layout.tsx`): every page renders inside `TimerProvider → WorkspaceProvider → GlobalLoader`. The layout also holds a persistent `Sidebar` (navigation, workspace list and mini timer), the page content in `<main>`, and a persistent `TaskPanel` (the tasks of the selected workspace). Because these sit in the layout, the timer and task state survive route changes.

**Persistence** (`lib/local-store.ts`): typed load and save helpers for the `localStorage` keys `pomo_workspaces`, `pomo_tasks` and `pomo_current_workspace`. Every storage access is wrapped in try/catch and falls back to empty data. `loadAndMigrate()` runs once when the app starts:
- it guarantees at least one workspace exists ("Personal")
- it moves tasks from the pre-revamp `local_tasks` key into that workspace, then deletes the key
- it reassigns any task whose workspace no longer exists

**State lives in contexts, not pages:**
- `contexts/workspace-context.tsx` owns workspaces, tasks and the selected workspace.
  - It loads everything via `loadAndMigrate()` on mount.
  - It saves to `localStorage` on every change. Saving is skipped while `loading` is true, so the empty initial state never overwrites stored data.
  - It holds all tasks for all workspaces. Filter by `workspace_id` when you need one workspace's tasks.
  - Every task belongs to a workspace, and new tasks go into the selected one.
  - Deleting a workspace deletes its tasks, and deleting the last workspace recreates "Personal". So there is always a selected workspace.
  - The context type definitions live in `lib/types.ts`.
- `contexts/timer-context.tsx` is a thin wrapper that exposes `hooks/use-timer.ts`. The hook holds the timer logic:
  - focus / shortBreak / longBreak modes
  - timing based on `requestAnimationFrame` and `performance.now()`, with visibility-change handling
  - sounds from `public/sounds/`
  - settings stored in `localStorage` under `pomo_timer_settings`, in seconds

**Task ordering:** tasks carry a numeric `order`, counted within their workspace. New tasks get `max(order) + 1000`, which leaves gaps for reordering. Drag-and-drop in `TaskPanel` uses @dnd-kit and calls `updateTaskOrder`.

**Pages:**
- `/` is the dashboard (`DashboardStats` counts across all workspaces, plus `TimerDisplay`).
- `/tasks` is the overview: one card per workspace with active and completed tasks.
- `/about`, `/privacy` and `/terms` are static.
- When you add a page, also add it to `public/sitemap.xml`.

## Conventions

- Import alias `@/*` maps to the repo root.
- shadcn/ui primitives live in `components/ui/` (configured in `components.json`, using lucide icons). Add new primitives with the shadcn CLI rather than writing them by hand.
- Any new user data must go through `lib/local-store.ts` (or follow its try/catch pattern), and it must be safe when storage is empty, corrupt or unavailable.
