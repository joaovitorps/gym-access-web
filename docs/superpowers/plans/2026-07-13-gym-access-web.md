# Gym Access Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, unified role-based React web app that consumes the existing Fastify `gym-access` API, serving both gym members and admins.

**Architecture:** Feature-based folder structure. TanStack Query manages server state. React Hook Form + Zod handle forms. Framer Motion handles animations. Native `fetch` is the API client. Auth token lives in memory; refresh token is an `httpOnly` cookie.

**Tech Stack:** Vite, React 19, TypeScript, React Router DOM, Tailwind CSS, TanStack Query, React Hook Form, Zod, Framer Motion, Lucide React, Sonner, Vitest, React Testing Library, MSW.

---

## Task 1: Scaffold the Vite project and install dependencies

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `.env.example`
- Create: `src/app/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/index.css`

- [ ] **Step 1: Initialize Vite with React and TypeScript**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

Expected: Vite scaffolds the project in the current directory.

- [ ] **Step 2: Install runtime dependencies**

Run:
```bash
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools react-hook-form zod @hookform/resolvers framer-motion lucide-react sonner clsx tailwind-merge
```

Expected: All runtime packages are added to `dependencies`.

- [ ] **Step 3: Install dev dependencies**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw@latest @vitejs/plugin-react-swc tailwindcss postcss autoprefixer @types/node
```

Expected: All dev packages are added to `devDependencies`.

- [ ] **Step 4: Initialize Tailwind CSS**

Run:
```bash
npx tailwindcss init -p
```

Then edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F5F3',
        surface: '#FFFFFF',
        'text-primary': '#111111',
        'text-secondary': '#6B6B6B',
        accent: '#FF4D00',
        success: '#007A5E',
        error: '#C72C2C',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Configure base CSS**

Create `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply bg-background text-text-primary font-body antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

- [ ] **Step 6: Add environment file**

Create `.env.example`:

```bash
VITE_API_URL=http://localhost:8001
```

- [ ] **Step 7: Add scripts to package.json**

Modify `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: scaffold vite react project with tailwind and dependencies"
```

---

## Task 2: Create core infrastructure

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/api.ts`
- Create: `src/lib/queryClient.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/ErrorState.tsx`
- Create: `src/components/ui/ToastProvider.tsx`

- [ ] **Step 1: Add utility helpers**

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
```

- [ ] **Step 2: Create the fetch API client**

Create `src/lib/api.ts`:

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

let authToken: string | null = null

export function setApiToken(token: string | null) {
  authToken = token
}

export function getApiToken() {
  return authToken
}

export async function api<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${input}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body.message || 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
```

- [ ] **Step 3: Configure TanStack Query client**

Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false
        return failureCount < 3
      },
    },
  },
})
```

- [ ] **Step 4: Create UI primitives**

Create `src/components/ui/Button.tsx`:

```typescript
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-text-primary text-surface hover:bg-text-primary/90': variant === 'primary',
            'bg-surface text-text-primary border border-text-primary/10 hover:bg-background': variant === 'secondary',
            'bg-error text-surface hover:bg-error/90': variant === 'danger',
            'text-text-secondary hover:bg-background': variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-4 text-base': size === 'md',
            'h-14 px-6 text-lg': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {isLoading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
```

Create `src/components/ui/Input.tsx`:

```typescript
import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label ? (
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-lg border border-text-primary/10 bg-surface px-3 py-2 text-sm placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus-visible:ring-error',
            className,
          )}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-error">{error}</p> : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
```

Create the remaining primitives (`Card`, `Modal`, `Skeleton`, `EmptyState`, `ErrorState`, `ToastProvider`) with consistent styling.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add api client, query client, and ui primitives"
```

---

## Task 3: Build auth infrastructure

**Files:**
- Create: `src/features/auth/schemas.ts`
- Create: `src/features/auth/api.ts`
- Create: `src/features/auth/AuthContext.tsx`
- Create: `src/features/auth/AuthGuard.tsx`
- Create: `src/features/auth/LoginPage.tsx`
- Create: `src/features/auth/RegisterPage.tsx`
- Create: `src/features/auth/tests/LoginPage.test.tsx`

- [ ] **Step 1: Define auth schemas**

Create `src/features/auth/schemas.ts`:

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

- [ ] **Step 2: Create auth API functions**

Create `src/features/auth/api.ts`:

```typescript
import { api } from '@/lib/api'
import type { LoginInput, RegisterInput } from './schemas'

export async function login(data: LoginInput) {
  return api<{ token: string }>('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function register(data: RegisterInput) {
  return api<void>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function refreshToken() {
  return api<{ token: string }>('/token/refresh', {
    method: 'PATCH',
  })
}

export async function getProfile() {
  return api<{ user: { id: string; name: string; email: string; role: 'ADMIN' | 'USER'; created_at: string } }>('/me')
}
```

- [ ] **Step 3: Create AuthContext**

Create `src/features/auth/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { setApiToken } from '@/lib/api'
import { refreshToken, getProfile } from './api'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  created_at: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    refreshToken()
      .then(({ token }) => {
        setApiToken(token)
        setToken(token)
        return getProfile()
      })
      .then(({ user }) => setUser(user))
      .catch(() => {
        setApiToken(null)
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = (newToken: string) => {
    setApiToken(newToken)
    setToken(newToken)
    getProfile().then(({ user }) => setUser(user))
  }

  const logout = () => {
    setApiToken(null)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 4: Create AuthGuard**

Create `src/features/auth/AuthGuard.tsx`:

```typescript
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="p-8 text-center">Loading...</div>
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

export function PublicOnlyGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()

  if (isLoading) return <div className="p-8 text-center">Loading...</div>
  if (token) return <Navigate to="/" replace />

  return children
}
```

- [ ] **Step 5: Create LoginPage and RegisterPage**

Create `src/features/auth/LoginPage.tsx` using React Hook Form + Zod, calling `login` mutation and storing token.

Create `src/features/auth/RegisterPage.tsx` similarly, then redirecting to `/login` on success.

- [ ] **Step 6: Test auth forms**

Create `src/features/auth/tests/LoginPage.test.tsx` with MSW handlers for `/sessions` and `/me`.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add auth infrastructure, login and register pages"
```

---

## Task 4: Build gyms feature

**Files:**
- Create: `src/features/gyms/schemas.ts`
- Create: `src/features/gyms/api.ts`
- Create: `src/features/gyms/hooks.ts`
- Create: `src/features/gyms/GymCard.tsx`
- Create: `src/features/gyms/GymsSearchPage.tsx`
- Create: `src/features/gyms/GymsNearbyPage.tsx`
- Create: `src/features/gyms/RegisterGymModal.tsx`
- Create: `src/features/gyms/tests/GymsSearchPage.test.tsx`

- [ ] **Step 1: Define gym schemas**

Create `src/features/gyms/schemas.ts`:

```typescript
import { z } from 'zod'

export const gymSearchSchema = z.object({
  q: z.string().min(1, 'Search term is required'),
})

export const registerGymSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
})

export type GymSearchInput = z.infer<typeof gymSearchSchema>
export type RegisterGymInput = z.infer<typeof registerGymSchema>
```

- [ ] **Step 2: Create gym API functions**

Create `src/features/gyms/api.ts`:

```typescript
import { api } from '@/lib/api'
import type { RegisterGymInput } from './schemas'

export interface Gym {
  id: string
  title: string
  description: string | null
  phone: string | null
  latitude: number
  longitude: number
}

export async function searchGyms(query: string, page: number) {
  return api<{ gyms: Gym[] }>(`/gyms/search?q=${encodeURIComponent(query)}&page=${page}`)
}

export async function fetchNearbyGyms(latitude: number, longitude: number) {
  return api<{ gyms: Gym[] }>(`/gyms/nearby?latitude=${latitude}&longitude=${longitude}`)
}

export async function registerGym(data: RegisterGymInput) {
  return api<void>('/gyms', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

- [ ] **Step 3: Create gym query/mutation hooks**

Create `src/features/gyms/hooks.ts`:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
import { searchGyms, fetchNearbyGyms, registerGym } from './api'
import type { RegisterGymInput } from './schemas'

export function useGymsSearch(query: string, page: number) {
  return useQuery({
    queryKey: ['gyms', 'search', { query, page }],
    queryFn: () => searchGyms(query, page),
    enabled: query.length > 0,
  })
}

export function useNearbyGyms(latitude: number | null, longitude: number | null) {
  return useQuery({
    queryKey: ['gyms', 'nearby', { latitude, longitude }],
    queryFn: () => fetchNearbyGyms(latitude!, longitude!),
    enabled: latitude !== null && longitude !== null,
  })
}

export function useRegisterGymMutation() {
  return useMutation({
    mutationFn: registerGym,
  })
}
```

- [ ] **Step 4: Create GymCard**

Create `src/features/gyms/GymCard.tsx` showing title, description, phone, distance (passed as prop), and a Check-in button. Use `motion.div` for hover scale.

- [ ] **Step 5: Create GymsSearchPage**

Create `src/features/gyms/GymsSearchPage.tsx`:
- Search input with React Hook Form.
- Paginated gym cards.
- “Register gym” button for admins that opens `RegisterGymModal`.

- [ ] **Step 6: Create GymsNearbyPage**

Create `src/features/gyms/GymsNearbyPage.tsx`:
- Request browser geolocation on mount.
- Show manual lat/long fallback on denial/timeout/error.
- Sort gyms by calculated distance and render `GymCard` list.
- “Register gym” button for admins.

- [ ] **Step 7: Create RegisterGymModal**

Create `src/features/gyms/RegisterGymModal.tsx`:
- Modal with form for title, description, phone, latitude, longitude.
- On success, close modal, invalidate gym queries, show success toast.

- [ ] **Step 8: Test gym search**

Create `src/features/gyms/tests/GymsSearchPage.test.tsx` with MSW handlers for `/gyms/search`.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add gyms feature with search, nearby, and admin registration"
```

---

## Task 5: Build check-ins feature

**Files:**
- Create: `src/features/check-ins/api.ts`
- Create: `src/features/check-ins/hooks.ts`
- Create: `src/features/check-ins/CheckInButton.tsx`
- Create: `src/features/check-ins/CheckInHistoryList.tsx`
- Create: `src/features/check-ins/CheckInMetricsCard.tsx`
- Create: `src/features/check-ins/ValidateCheckInButton.tsx`
- Create: `src/features/check-ins/tests/CheckInButton.test.tsx`

- [ ] **Step 1: Create check-in API functions**

Create `src/features/check-ins/api.ts`:

```typescript
import { api } from '@/lib/api'

export interface CheckIn {
  id: string
  created_at: string
  validated_at: string | null
  gym_id: string
  user_id: string
}

export async function checkIn(gymId: string, latitude: number, longitude: number) {
  return api<void>(`/gyms/${gymId}/check-ins`, {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  })
}

export async function fetchCheckInHistory(page: number) {
  return api<{ checkIns: CheckIn[] }>(`/check-ins/history?page=${page}`)
}

export async function fetchCheckInMetrics() {
  return api<{ userTotalOfCheckIns: number }>('/check-ins/metrics')
}

export async function validateCheckIn(checkInId: string) {
  return api<{ checkIn: CheckIn }>(`/check-ins/${checkInId}/validate`, {
    method: 'PATCH',
  })
}
```

- [ ] **Step 2: Create check-in hooks**

Create `src/features/check-ins/hooks.ts`:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
import { checkIn, fetchCheckInHistory, fetchCheckInMetrics, validateCheckIn } from './api'

export function useCheckInHistory(page: number) {
  return useQuery({
    queryKey: ['check-ins', 'history', { page }],
    queryFn: () => fetchCheckInHistory(page),
  })
}

export function useCheckInMetrics() {
  return useQuery({
    queryKey: ['check-ins', 'metrics'],
    queryFn: fetchCheckInMetrics,
  })
}

export function useCheckInMutation() {
  return useMutation({
    mutationFn: ({ gymId, latitude, longitude }: { gymId: string; latitude: number; longitude: number }) =>
      checkIn(gymId, latitude, longitude),
  })
}

export function useValidateCheckInMutation() {
  return useMutation({
    mutationFn: validateCheckIn,
  })
}
```

- [ ] **Step 3: Create CheckInButton**

Create `src/features/check-ins/CheckInButton.tsx`:
- Triggers browser geolocation.
- Calls `useCheckInMutation`.
- On success, invalidate history and metrics queries, show success toast.
- On error, show error toast with backend message.
- When within 100 m, render the pulsing proximity ring.

- [ ] **Step 4: Create CheckInHistoryList**

Create `src/features/check-ins/CheckInHistoryList.tsx`:
- Paginated list of check-ins.
- Each card shows date/time, gym title (via gym data if available), validation status.
- Admin sees “Validate” button on unvalidated check-ins.

- [ ] **Step 5: Create CheckInMetricsCard**

Create `src/features/check-ins/CheckInMetricsCard.tsx`:
- Large monospace number for total check-ins.
- Framer Motion count-up animation.

- [ ] **Step 6: Create ValidateCheckInButton**

Create `src/features/check-ins/ValidateCheckInButton.tsx`:
- Admin-only button.
- Calls `useValidateCheckInMutation`.
- On success, invalidate history query.

- [ ] **Step 7: Test check-in button**

Create `src/features/check-ins/tests/CheckInButton.test.tsx` mocking geolocation and MSW handler for `POST /gyms/:gymId/check-ins`.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add check-ins feature with history, metrics, and validation"
```

---

## Task 6: Build dashboard, profile, and layout

**Files:**
- Create: `src/app/Layout.tsx`
- Create: `src/app/DashboardPage.tsx`
- Create: `src/app/ProfilePage.tsx`
- Create: `src/app/Router.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/main.tsx`

- [ ] **Step 1: Create Layout with navigation**

Create `src/app/Layout.tsx`:
- Top or bottom navigation with links to Dashboard, Gyms, Nearby, Profile.
- Show user name and role.
- Logout button.
- AnimatePresence wrapper for page transitions.

- [ ] **Step 2: Create DashboardPage**

Create `src/app/DashboardPage.tsx`:
- `CheckInMetricsCard`.
- Recent `CheckInHistoryList` (page 1).
- Quick action cards: “Find gyms”, “Nearby gyms”.
- Admin-only section: pending validations shortcut and “Register gym” button.

- [ ] **Step 3: Create ProfilePage**

Create `src/app/ProfilePage.tsx`:
- Display user name, email, role.
- Logout button.

- [ ] **Step 4: Wire up Router**

Create `src/app/Router.tsx`:

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthGuard, PublicOnlyGuard } from '@/features/auth/AuthGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardPage } from './DashboardPage'
import { ProfilePage } from './ProfilePage'
import { GymsSearchPage } from '@/features/gyms/GymsSearchPage'
import { GymsNearbyPage } from '@/features/gyms/GymsNearbyPage'
import { Layout } from './Layout'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicOnlyGuard><LoginPage /></PublicOnlyGuard>,
  },
  {
    path: '/register',
    element: <PublicOnlyGuard><RegisterPage /></PublicOnlyGuard>,
  },
  {
    path: '/',
    element: <AuthGuard><Layout /></AuthGuard>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'gyms', element: <GymsSearchPage /> },
      { path: 'gyms/nearby', element: <GymsNearbyPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 5: Update App and main entry**

Update `src/app/App.tsx`:

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import { queryClient } from '@/lib/queryClient'
import { Router } from './Router'
import { Toaster } from 'sonner'
import { MotionConfig } from 'framer-motion'

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster position="bottom-center" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add dashboard, profile, layout, and router"
```

---

## Task 7: Polish, animations, and empty/error states

**Files:**
- Modify: various pages and components
- Create: `src/hooks/useGeolocation.ts`

- [ ] **Step 1: Create useGeolocation hook**

Create `src/hooks/useGeolocation.ts`:

```typescript
import { useCallback, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  isLoading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null,
  })

  const request = useCallback(() => {
    setState((s) => ({ ...s, isLoading: true, error: null }))

    if (!navigator.geolocation) {
      setState((s) => ({ ...s, isLoading: false, error: 'Geolocation is not supported' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isLoading: false,
          error: null,
        })
      },
      (error) => {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: error.message || 'Unable to retrieve location',
        }))
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return { ...state, request }
}
```

- [ ] **Step 2: Add page transitions**

Wrap the route outlet in `Layout.tsx` with `<AnimatePresence mode="wait">` and `motion.div` with initial/animate/exit variants.

- [ ] **Step 3: Add list stagger animations**

Update `GymCard` list and `CheckInHistoryList` to use parent/child Framer Motion variants.

- [ ] **Step 4: Add proximity pulse**

In `CheckInButton`, when distance ≤ 100 m, render an animated ring:

```typescript
<motion.span
  className="absolute inset-0 rounded-full border-2 border-accent"
  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
  transition={{ duration: 1.5, repeat: Infinity }}
/>
```

- [ ] **Step 5: Add metric count-up**

In `CheckInMetricsCard`, animate the number from 0 to total on first render using `useMotionValue` and `useTransform` or a simple animated counter hook.

- [ ] **Step 6: Add empty and error states**

Use `EmptyState` and `ErrorState` components on all list pages.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add animations, geolocation hook, and empty/error states"
```

---

## Task 8: Final testing and verification

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/test/msw/handlers.ts`
- Create: `src/test/msw/server.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Configure Vitest**

Update `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 2: Set up MSW**

Create `src/test/msw/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { server } from './msw/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 3: Add MSW handlers**

Create `src/test/msw/handlers.ts` with handlers for:
- `POST /sessions`
- `POST /users`
- `PATCH /token/refresh`
- `GET /me`
- `GET /gyms/search`
- `GET /gyms/nearby`
- `POST /gyms`
- `GET /check-ins/history`
- `GET /check-ins/metrics`
- `POST /gyms/:gymId/check-ins`
- `PATCH /check-ins/:checkInId/validate`

- [ ] **Step 4: Run the test suite**

Run:
```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Run the dev server and verify**

Run:
```bash
npm run dev
```

Expected: App starts on `http://localhost:5173`.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "test: configure vitest, msw, and add test coverage"
```

---

## Self-review checklist

- [ ] Every backend endpoint has a corresponding API function, hook, and UI surface.
- [ ] Admin actions are gated by role and appear inline.
- [ ] Auth token is memory-only; refresh cookie is sent automatically.
- [ ] All animations respect `prefers-reduced-motion`.
- [ ] No axios dependency exists; only native `fetch` is used.
- [ ] CORS note is documented for the Fastify backend.
- [ ] Tests cover auth forms, route guards, gym search, and check-in flow.
