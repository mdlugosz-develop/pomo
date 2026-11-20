# Revamp: signed-out-only PomoTime

## Context
Right now PomoTime has two modes. Signed-in users keep workspaces and tasks in Supabase. Signed-out users get one flat list of tasks in localStorage, with no workspaces and no overview page.

The goal is to remove sign-in completely and make the signed-out experience the whole product:
- users can create as many workspaces as they want
- every task belongs to a workspace
- the Tasks Overview (`/tasks`) shows all workspaces, grouped by workspace
- everything is stored in localStorage

Decisions confirmed with the user:
- Delete the auth and Supabase code rather than hiding it behind a flag. Git history keeps it.
- No workspace limit, so `WorkspaceLimitModal` goes.
- On first load, create a "Personal" workspace and move any existing tasks without a workspace into it.
- Keep the overview grouped by workspace (the current `/tasks` layout), open to everyone.

---

## Phase 1: Local storage layer
Build a small persistence module to replace the Supabase calls.

- New file `lib/local-store.ts` with typed load and save helpers for three keys:
  - `pomo_workspaces`: `Workspace[]`
  - `pomo_tasks`: `Task[]`
  - `pomo_current_workspace`: the id of the selected workspace
- Wrap every read and write in try/catch, and fall back to `[]` if the data is missing or corrupt.
- Migration helper:
  - If `local_tasks` (the old key) exists, or there are no workspaces at all, create `{ id: crypto.randomUUID(), name: 'Personal' }`.
  - Give every task without a workspace (`workspace_id === ''`) that workspace's id.
  - Copy the old `local_tasks` data into `pomo_tasks`, then delete `local_tasks`.
- `lib/types.ts`:
  - Remove `user_id` from `Workspace`.
  - Make this file the single source of truth for `WorkspaceContextType`, `CreateTaskInput` and `TaskOrderUpdate`, including `updateTaskOrder`. Delete the duplicate definitions in `contexts/workspace-context.tsx`.

## Phase 2: Rewrite `WorkspaceProvider` to use local storage only
File: `contexts/workspace-context.tsx`

- Remove `useAuth`, `supabase`, the realtime channel, every `if (!user)` branch, and `WorkspaceLimitModal`.
- On mount:
  - run the migration
  - load workspaces and tasks
  - restore the selected workspace, or fall back to the first one
  - then set `loading = false`
- Save workspaces, tasks and the selected workspace id to localStorage whenever they change. Only start saving after the first load has finished, so the initial empty state never overwrites stored data.
- `createWorkspace`: build the workspace locally with `crypto.randomUUID()` and select it. No limit.
- `createTask`: always set `workspace_id: currentWorkspace.id`.
  - Calculate `order` from the tasks in that workspace only. The existing `max + 1000` scheme stays.
- `updateTask` / `deleteTask` / `updateTaskOrder`: local state updates only. Drop the `isOptimistic` parameter, or keep it and ignore it, and update the caller in `components/task-panel.tsx` to match.
- `deleteWorkspace`:
  - delete the workspace's tasks along with it
  - select another workspace
  - if no workspaces are left, create a fresh "Personal" one so the task panel always has somewhere to add tasks
- Use functional `setState` updates throughout (`setTasks(prev => …)`), because several callers run back to back.

## Phase 3: Remove auth
- Delete:
  - `contexts/auth-context.tsx` and `contexts/session-context.tsx` (which is empty)
  - `components/auth-button.tsx`, `sign-in-dialog.tsx`, `sign-up-dialog.tsx`, `user-profile.tsx`, `workspace-limit-modal.tsx`
  - `app/auth/callback/`
  - `app/profile/`
  - `lib/supabase.ts` and `lib/security-constants.ts`
- Delete `middleware.ts` entirely. No route needs protecting any more.
- `app/layout.tsx`: remove `AuthProvider`.
- `components/global-loader.tsx`: wait only on the workspace `loading` state.
- `hooks/use-timer.ts`:
  - Remove `useAuth` and `supabase`.
  - Persist timer settings to the localStorage key `pomo_timer_settings`, in seconds.
  - Load them on mount and save them in `updateSettings`.
  - Today guests' timer settings are never saved, so this is a small improvement.
- `package.json`: uninstall `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `js-cookie`, `@types/js-cookie` and `@types/google-one-tap`.
- Remove `/profile` (and any auth URLs) from `public/sitemap.xml`.

## Phase 4: UI updates
- `components/sidebar.tsx`: remove the `AuthButton` / `UserProfile` footer.
- `components/workspaces.tsx`:
  - Remove the `user` checks so `CreateWorkspaceDialog` and the list always show.
  - Update the delete confirmation to warn that the workspace's tasks will be deleted too.
- `components/task-panel.tsx`:
  - Always filter by `currentWorkspace.id`.
  - Make the header show `currentWorkspace.name`, removing the "Local Tasks" title.
- `app/tasks/page.tsx`: remove the "Sign in Required" gate. The grouped-by-workspace layout already works off `workspaces` and `tasks`.
  - Clicking an active task currently marks it complete. Keep that behaviour.
- `components/dashboard-stats.tsx`: no logic change. "Active Projects" now counts local workspaces.

## Phase 5: Copy, docs and cleanup
- `app/privacy/page.tsx` and `app/terms/page.tsx`:
  - Remove the references to accounts and Supabase.
  - Say that all data stays in the browser's localStorage and is lost if site data is cleared.
- Update `CLAUDE.md`:
  - remove the auth, middleware and Supabase sections
  - describe the localStorage model
  - drop the env var requirement
- Delete the outdated `instructions.md`.

---

## Critical files
`contexts/workspace-context.tsx`, `lib/types.ts`, `lib/local-store.ts` (new), `hooks/use-timer.ts`, `app/layout.tsx`, `components/{global-loader,sidebar,workspaces,task-panel}.tsx`, `app/tasks/page.tsx`, `middleware.ts` (deleted), `package.json`

Existing pieces to reuse:
- the `order` / drag-and-drop logic in `task-panel.tsx`
- the grouping logic in `app/tasks/page.tsx`
- `CreateWorkspaceDialog` as is
- `DashboardStats` as is

## Verification
1. `npm run lint` and `npm run build` pass with no Supabase env vars set. This proves Supabase is fully gone.
2. `grep -rn "supabase\|useAuth\|js-cookie" app components contexts hooks lib` returns nothing.
3. Manual check in `npm run dev`:
   - **Fresh profile:** a "Personal" workspace appears.
   - **Workspaces and tasks:** create two more workspaces and add tasks to each. Switching workspaces changes the task panel.
   - **Overview:** `/tasks` shows all three workspaces with their tasks grouped, and the dashboard counts are correct.
   - **Persistence:** after a reload, workspaces, tasks, the selected workspace, task order and timer settings are all still there.
   - **Deleting:** deleting a workspace removes its tasks. Deleting the last one creates a new "Personal" workspace.
   - **Migration:** set `localStorage.local_tasks` to an old-format array with `workspace_id: ''`, then reload. The tasks show up under "Personal" and `local_tasks` is gone.
   - **Old routes:** `/profile` and `/auth/callback` return 404.
