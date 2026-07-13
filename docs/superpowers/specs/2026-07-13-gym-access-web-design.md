# Gym Access Web — Design Spec

**Date:** 2026-07-13  
**Status:** Approved

## Goal

Build a mobile-first, unified role-based React web application that consumes the existing Fastify `gym-access` API. The app serves both gym members (search gyms, check in, view history and metrics) and admins (register gyms, validate check-ins) in a single interface.

## Backend Context

The API lives at `Projects/rocketseat/nodejs/gym-access` and exposes:

- **Auth / users**
  - `POST /users` — register (name, email, password)
  - `POST /sessions` — authenticate → returns `{ token }` and sets an `httpOnly` refresh-token cookie
  - `PATCH /token/refresh` — refresh access token
  - `GET /me` — current user profile
- **Gyms** (authenticated)
  - `GET /gyms/search?q=&page=` — search by name
  - `GET /gyms/nearby?latitude=&longitude=` — gyms within 10 km
  - `POST /gyms` — admin only: register a gym
- **Check-ins** (authenticated)
  - `POST /gyms/:gymId/check-ins` — user checks in (sends lat/long; must be within 100 m)
  - `GET /check-ins/history?page=` — paginated history
  - `GET /check-ins/metrics` — total check-ins count
  - `PATCH /check-ins/:checkInId/validate` — admin only: validate a check-in

## Tech Stack

- **Build tool:** Vite
- **Framework:** React 19 + React Router DOM
- **Styling:** Tailwind CSS
- **Server state:** TanStack Query
- **Forms:** React Hook Form + Zod
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Testing:** Vitest + React Testing Library + MSW
- **API client:** Native `fetch`

## Visual Direction

Industrial utility aesthetic — functional, confident, and distinct from generic SaaS templates.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `bg` | `#F5F5F3` | page background (warm concrete) |
| `surface` | `#FFFFFF` | cards, modals |
| `text-primary` | `#111111` | headings, primary text |
| `text-secondary` | `#6B6B6B` | captions, meta text |
| `accent` | `#FF4D00` | primary CTAs, active check-in state, highlights |
| `success` | `#007A5E` | success states |
| `error` | `#C72C2C` | errors, destructive actions |

### Typography

- **Headings:** Space Grotesk — geometric, slightly technical.
- **Body:** Inter — highly readable.
- **Data / numbers:** JetBrains Mono — check-in counts, distances, timestamps.

### Signature Element

A **proximity-aware check-in button** on the gym detail screen. When the user is within the 100 m validation radius, an orange ring pulses around the button. After a successful check-in, the screen transitions to a bold typographic confirmation: “CHECKED IN” plus the timestamp in monospace.

### Animation (Framer Motion)

All motion respects `prefers-reduced-motion` via a top-level `<MotionConfig reducedMotion="user">`.

- **Page transitions** — `<AnimatePresence mode="wait">` wraps the route outlet; pages fade/slide in.
- **List stagger** — gym lists and history lists use parent/child variants with `staggerChildren: 0.05`.
- **Proximity pulse** — looping `motion.span` scale + opacity animation on the check-in button when within range.
- **Metric reveal** — dashboard total animates from 0 to current count on load.
- **Toast stack** — `<AnimatePresence mode="popLayout">` for smooth reordering.
- **Micro-interactions** — cards scale slightly on hover; buttons scale down on tap.

## Information Architecture & Routes

### Public routes

- `/login` — existing users sign in.
- `/register` — new members create an account.

### Private routes

- `/` — dashboard. Shows total check-ins, recent history, quick actions, and admin shortcuts if the user is an admin.
- `/gyms` — search gyms by name with pagination.
- `/gyms/nearby` — list nearby gyms using current location, with manual coordinate fallback.
- `/profile` — view current user info and role.

### Inline admin actions

Admin actions are not separate routes. They appear inline where relevant:

- “Register gym” button on `/gyms` and `/gyms/nearby`.
- “Validate check-in” action on check-in history cards in the dashboard.
- Pending-validations section on the dashboard for admins.

### Route guards

- Unauthenticated users hitting private routes are redirected to `/login`.
- Authenticated users hitting `/login` or `/register` are redirected to `/`.

## Auth & Data Flow

1. User logs in via `POST /sessions`. The backend returns `{ token }` and sets an `httpOnly` refresh-token cookie.
2. The access token is stored in memory inside an `AuthContext`.
3. The `api` client attaches the token to every request via `Authorization: Bearer <token>` and sends `credentials: "include"`.
4. On app mount, call `PATCH /token/refresh` (cookie is sent automatically). If it succeeds, restore the session; if it fails, the user lands on `/login`.
5. On logout, clear the in-memory token and any cached query data.

### TanStack Query integration

- QueryClient wraps the app.
- Query keys:
  - `["me"]` — profile
  - `["gyms", "search", { q, page }]` — gym search
  - `["gyms", "nearby", { latitude, longitude }]` — nearby gyms
  - `["check-ins", "history", { page }]` — check-in history
  - `["check-ins", "metrics"]` — check-in metrics
- Mutations:
  - `login`, `register`
  - `checkIn(gymId, latitude, longitude)`
  - `registerGym(...)`
  - `validateCheckIn(checkInId)`
- On successful check-in, invalidate `["check-ins", "history"]` and `["check-ins", "metrics"]` so the dashboard updates.

### CORS

The Fastify backend must allow the front-end origin with `credentials: true`. If the front-end runs on Vite’s default `http://localhost:5173`, that origin must be enabled on the backend. This is handled separately by the user.

## Feature Organization

Feature-based folder structure:

```
src/
  features/
    auth/
      LoginPage.tsx
      RegisterPage.tsx
      AuthContext.tsx
      AuthGuard.tsx
      api/
      hooks/
      schemas/
      tests/
    gyms/
      GymsSearchPage.tsx
      GymsNearbyPage.tsx
      GymCard.tsx
      RegisterGymModal.tsx
      api/
      hooks/
      schemas/
      tests/
    check-ins/
      CheckInButton.tsx
      CheckInHistoryList.tsx
      CheckInMetricsCard.tsx
      ValidateCheckInButton.tsx
      api/
      hooks/
      schemas/
      tests/
  components/
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      Modal.tsx
      Skeleton.tsx
      EmptyState.tsx
      ErrorState.tsx
      ToastProvider.tsx
  lib/
    api.ts
    queryClient.ts
    utils.ts
  app/
    DashboardPage.tsx
    ProfilePage.tsx
    Layout.tsx
    Router.tsx
    main.tsx
```

## Error Handling

### Form errors

- Zod schemas run on blur/submit and show inline messages under each field.
- Duplicate email on register (409) shows a field-level error on the email input.
- Invalid credentials on login (400) shows a form-level error banner.

### API errors

- Global API errors (401, 403, 500, network failures) are caught by the `api` client and surfaced via Sonner toast.
- 401 on an authenticated request triggers a token refresh; if refresh fails, redirect to `/login`.
- 403 (forbidden admin action) shows a toast: “You don’t have permission to do that.”
- Query errors render an `<ErrorState>` component with a retry button that calls `queryClient.refetchQueries`.

### Location errors

- Browser permission denied → show manual latitude/longitude fallback input.
- Location timeout → show a retry button and the manual fallback.
- Invalid coordinates → Zod validation error on the fallback fields.

### Mutation errors

- Failed check-in (e.g., not within 100 m) → toast with the backend message.
- Failed validation (after 20 min) → toast with the backend message.

## Testing Strategy

- **Unit/component tests** with Vitest + React Testing Library:
  - Form validation via simulated user input and submit.
  - Route guards with `<MemoryRouter>` and auth context.
  - Utility functions: distance calculation, coordinate formatting.
  - Query hooks with TanStack Query test utilities and mocked `fetch` responses.
- **API mocking** with MSW to intercept `fetch` calls, keeping tests deterministic and fast.
- **Not in scope:** End-to-end browser tests (no Playwright in this version).
