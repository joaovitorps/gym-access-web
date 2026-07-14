# Show Gym Name in Recent History — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the gym name in each check-in card on the home page's "Recent history" section.

**Architecture:** Nested `gym` object is added to the `CheckIn` API contract. `CheckInHistoryList` reads `checkIn.gym.title` and renders it as the card's primary label. MSW handler and a new component test are updated accordingly.

**Tech Stack:** React, TypeScript, TanStack Query, MSW, Vitest

---

### Task 1: Update CheckIn type

**Files:**
- Modify: `src/features/check-ins/api.ts`

- [ ] **Step 1: Add gym field to CheckIn interface**

Replace the existing `CheckIn` interface:

```ts
export interface CheckIn {
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

- [ ] **Step 2: Run tests to confirm existing tests still pass**

Run: `npm test`
Expected: Tests pass (existing tests don't depend on the exact CheckIn shape).

- [ ] **Step 3: Commit**

```bash
git add src/features/check-ins/api.ts
git commit -m "feat: add gym field to CheckIn type"
```

---

### Task 2: Update MSW handler to return gym data

**Files:**
- Modify: `src/test/msw/handlers.ts`

- [ ] **Step 1: Add gym object to mock check-in**

Replace the `http.get("*/check-ins/history", ...)` handler's check-in item:

```ts
http.get("*/check-ins/history", () => {
  return HttpResponse.json({
    checkIns: [
      {
        id: "checkin-1",
        created_at: "2026-07-13T10:00:00.000Z",
        validated_at: null,
        gym_id: "gym-1",
        user_id: "user-1",
        gym: { id: "gym-1", title: "JS Gym" },
      },
    ],
  });
}),
```

- [ ] **Step 2: Run tests to confirm MSW mock works**

Run: `npm test`
Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/test/msw/handlers.ts
git commit -m "test: add gym data to check-in history mock"
```

---

### Task 3: Display gym title in CheckInHistoryList

**Files:**
- Modify: `src/features/check-ins/CheckInHistoryList.tsx`

- [ ] **Step 1: Add gym title rendering to check-in card**

Inside the `<Card>` in the `data.checkIns.map(...)` block, add the gym title above the date. Replace the current card content div:

```tsx
<Card className="flex items-center justify-between gap-4">
  <div>
    <p className="font-medium text-text-primary">
      {checkIn.gym?.title || "Unknown gym"}
    </p>
    <p className="font-mono text-sm text-text-secondary">
      {formatDateTime(checkIn.created_at)}
    </p>
    <p className="text-sm text-text-secondary">
      {checkIn.validated_at ? (
        <span className="inline-flex items-center gap-1.5 text-success">
          Validated
        </span>
      ) : (
        <span className="text-text-secondary">Pending validation</span>
      )}
    </p>
  </div>
  {isAdmin && !checkIn.validated_at ? (
    <ValidateCheckInButton checkInId={checkIn.id} />
  ) : null}
</Card>
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/check-ins/CheckInHistoryList.tsx
git commit -m "feat: show gym name in recent history cards"
```

---

### Task 4: Add CheckInHistoryList test

**Files:**
- Create: `src/features/check-ins/tests/CheckInHistoryList.test.tsx`

- [ ] **Step 1: Write the component test**

Create the test file:

```tsx
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { CheckInHistoryList } from "../CheckInHistoryList";

const server = setupServer(
  http.get("*/check-ins/history", () => {
    return HttpResponse.json({
      checkIns: [
        {
          id: "checkin-1",
          created_at: "2026-07-13T10:00:00.000Z",
          validated_at: null,
          gym_id: "gym-1",
          user_id: "user-1",
          gym: { id: "gym-1", title: "JS Gym" },
        },
        {
          id: "checkin-2",
          created_at: "2026-07-12T08:30:00.000Z",
          validated_at: "2026-07-12T09:00:00.000Z",
          gym_id: "gym-2",
          user_id: "user-1",
          gym: { id: "gym-2", title: "Iron Paradise" },
        },
      ],
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CheckInHistoryList", () => {
  it("renders gym titles for each check-in", async () => {
    renderWithQuery(<CheckInHistoryList />);

    expect(await screen.findByText("JS Gym")).toBeInTheDocument();
    expect(screen.getByText("Iron Paradise")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test`
Expected: Both existing tests and the new test pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/check-ins/tests/CheckInHistoryList.test.tsx
git commit -m "test: add CheckInHistoryList unit test"
```

---

### Task 5: Push, create PR, and add opencode comment

**Files:**
- N/A — git operations

- [ ] **Step 1: Push branch to remote**

```bash
git push -u origin feature/home-history-gym-name
```

- [ ] **Step 2: Create PR on GitHub using gh CLI**

Use `gh pr create` with title "feat: show gym name in recent check-in history" and body describing the changes including the backend contract change needed.

- [ ] **Step 3: Add a PR comment marking opencode**

Use `gh pr comment` to add a comment: "This PR is open for opencode to review — update here until LGTM."

