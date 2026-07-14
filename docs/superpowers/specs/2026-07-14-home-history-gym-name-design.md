# Show Gym Name in Recent Check-in History

## Problem

The home page "Recent history" section lists check-ins by date/time and validation status, but does not show which gym the check-in was made at.

## Approach

Update the `/check-ins/history` API contract to return a nested `gym` object on each check-in, then display `gym.title` in `CheckInHistoryList`.

## Data Shape

**Before:**
```ts
interface CheckIn {
  id: string;
  created_at: string;
  validated_at: string | null;
  gym_id: string;
  user_id: string;
}
```

**After:**
```ts
interface CheckIn {
  id: string;
  created_at: string;
  validated_at: string | null;
  gym_id: string;
  user_id: string;
  gym: {
    id: string;
    title: string;
  };
}
```

## Files to Change

| File | Change |
|------|--------|
| `src/features/check-ins/api.ts` | Add `gym` field to `CheckIn` interface |
| `src/features/check-ins/CheckInHistoryList.tsx` | Render `checkIn.gym.title` as the primary card text |
| `src/test/msw/handlers.ts` | Return `gym` in `/check-ins/history` mock |
| `src/features/check-ins/tests/CheckInHistoryList.test.tsx` | New file — test that gym titles appear |

## UI Layout

Each check-in card currently has a date line and status line. The new layout promotes gym title as the most prominent text:

```
[Gym title (bold, primary)]     [Validate (admin)]
[date/time (muted, mono)]
[validation status]
```

If `checkIn.gym` or its `title` is absent, fall back to "Unknown gym".

## Testing

- New `CheckInHistoryList.test.tsx` mocks a history with two check-ins at different gyms.
- Asserts each gym title is visible.
- Verifies existing date/status rendering is preserved.
