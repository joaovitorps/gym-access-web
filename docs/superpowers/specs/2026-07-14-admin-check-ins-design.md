# Admin Check-In Approval — Design

## Context

Backend PR [#3](https://github.com/joaovitorps/gym-access/pull/3) added a new admin-only endpoint:

- `GET /check-ins` — returns **all users’** check-ins, paginated (`?page=`, 20 per page), sorted newest-first.

The existing member endpoint remains unchanged:

- `GET /check-ins/history` — returns only the logged-in user’s check-ins.

The current frontend already renders a **Validate** button for admins inside `CheckInHistoryList`, but it always fetches `/check-ins/history`. As a result, admins can only approve their own check-ins. We need to wire the new admin endpoint into the same list.

## Goal

Allow admins to view and approve any user’s check-ins by reusing the Dashboard’s “Recent history” list.

## Design

### API

Add a new function in `src/features/check-ins/api.ts`:

```ts
export async function fetchAllCheckInsHistory(page: number) {
  return api<{ checkIns: CheckIn[] }>(`/check-ins?page=${page}`);
}
```

The response shape is identical to `/check-ins/history`: `{ checkIns: CheckIn[] }`.

### Hooks

Add a new hook in `src/features/check-ins/hooks.ts`:

```ts
export function useAllCheckInsHistory(page: number) {
  return useQuery({
    queryKey: ["check-ins", "all", { page }],
    queryFn: () => fetchAllCheckInsHistory(page),
  });
}
```

Keep `useCheckInHistory` unchanged for members.

### Component behavior

In `CheckInHistoryList`:

- Read `user.role` from auth context.
- If `role === "ADMIN"`, use `useAllCheckInsHistory(page)`.
- If `role === "MEMBER"`, use `useCheckInHistory(page)`.
- Render the same card layout for both roles.
- For admins, display the `user_id` on each card so different users’ check-ins are distinguishable.
- Keep the existing **Validate** button for pending check-ins when the user is an admin.

### Mutation invalidation

After a successful validation in `ValidateCheckInButton`:

- Invalidate both query keys:
  - `["check-ins", "history"]` (member view)
  - `["check-ins", "all"]` (admin view)

This ensures either view refreshes correctly.

### Error handling

- If the admin endpoint returns **403**, show the toast: “You don’t have permission to do that.”
- Other errors are surfaced through the existing `ErrorState` / toast mechanisms.

### Tests

- Update MSW handlers in `src/features/check-ins/tests` to support `GET /check-ins`.
- Add a test rendering `CheckInHistoryList` as an admin and asserting:
  - It calls `/check-ins`.
  - Pending check-ins from other users show the **Validate** button.
  - Validated check-ins do not show the button.

## Non-goals

- No new route or page; the Dashboard list is reused.
- No pending-only filter in this iteration.
- No enrichment of `user_id` / `gym_id` with names (backend does not return them).

## Files changed

- `src/features/check-ins/api.ts`
- `src/features/check-ins/hooks.ts`
- `src/features/check-ins/CheckInHistoryList.tsx`
- `src/features/check-ins/ValidateCheckInButton.tsx`
- `src/features/check-ins/tests/*`
