# 🌿 Feel - Micro-Journaling App

> **For contributors & AI assistants:** This README is the single source of truth for every design decision, convention, and rule in this project. Read it fully before writing any code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Getting Started](#3-getting-started)
4. [Environment Variables](#4-environment-variables)
5. [Project Structure](#5-project-structure)
6. [Design System](#6-design-system)
7. [Coding Conventions — MUST FOLLOW](#7-coding-conventions--must-follow)
8. [Authentication Flow](#8-authentication-flow)
9. [Firebase Architecture](#9-firebase-architecture)
10. [Route Protection](#10-route-protection)
11. [Component Patterns](#11-component-patterns)
12. [CSS Module Conventions](#12-css-module-conventions)
13. [Feature Roadmap](#13-feature-roadmap)

---

## 1. Project Overview

**Feel** is a mindful micro-journaling web application. The core idea: write one meaningful line about your day, tag your mood, and build a habit that actually sticks.

**Key principles:**
- **One line a day** — 280 character max per journal entry
- **Mood tagging** — emoji-based mood tracking per entry
- **Streaks & insights** — consistency calendar and mood frequency charts
- **Privacy-first** — all entries belong to the user, Firestore rules enforce this

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS + CSS Modules (NO Tailwind, NO inline styles) |
| Animations | Framer Motion |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Form handling | React Hook Form + Zod |
| State | React Context (`useAuth`) |

---

## 3. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your Firebase credentials
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Important:** The dev server uses Turbopack. Always use `npm run dev`, not `next dev --no-turbo`.

---

## 4. Environment Variables

Copy `.env.example` → `.env.local` and fill in your values from the Firebase Console.

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

> **Never commit `.env.local`** — it is gitignored. `.env.example` (empty values only) is safe to commit.

---

## 5. Project Structure

```
Feel/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout — wraps everything in <AuthProvider>
│   ├── page.tsx                # Landing page (public)
│   ├── login/page.tsx          # Sign in page
│   ├── register/page.tsx       # Sign up page
│   ├── forgot-password/page.tsx  # Request password reset
│   ├── reset-password/page.tsx   # Set new password (via email link)
│   ├── dashboard/page.tsx      # Protected — 4-tab dashboard (Today, Timeline, Calendar, Stats)
│   └── globals.css             # Global CSS design tokens (colors, fonts, resets, utility classes)
│
├── components/
│   ├── Navbar.tsx              # Landing page navbar (public, tabs scroll to sections)
│   ├── auth/                   # Shared auth UI components
│   │   ├── AuthCard.tsx        # Card shell — logo + animated wrapper
│   │   ├── FieldError.tsx      # Field-level validation error message
│   │   ├── GoogleIcon.tsx      # Official Google "G" SVG icon
│   │   └── PasswordStrength.tsx # Animated 4-bar password strength meter
│   └── dashboard/
│       └── DashboardNavbar.tsx # Smart navbar — hides on scroll down, shows on scroll up
│
├── lib/
│   ├── firebase/
│   │   └── config.ts          # Firebase singleton (Auth, Firestore)
│   ├── hooks/
│   │   └── useAuth.tsx        # Auth context — user state + all auth methods
│   ├── utils/
│   │   ├── authCookie.ts      # Sets/clears __feel_authed cookie for middleware
│   │   └── errorHandler.ts    # Maps Firebase error codes → user-friendly messages
│   └── validations/
│       └── authSchema.ts      # Zod schemas: LoginSchema, RegisterSchema
│
├── styles/
│   ├── auth.module.css        # Auth pages + standalone dashboard card styles
│   ├── navbar.module.css      # Landing page navbar component styles
│   └── dashboard.module.css   # Dashboard navbar, panels, entry card, mood picker
│
├── proxy.ts                   # Next.js middleware — route protection
├── next.config.ts             # Next.js config (COOP header for Google OAuth)
└── .env.example               # Template for required environment variables
```

---

## 6. Design System

### Color Palette

All colors are CSS custom properties defined in `app/globals.css`. **Never hardcode hex values in components.**

| Token | Value | Usage |
|---|---|---|
| `--green-400` | `#4ade80` | Hover states, accents |
| `--green-500` | `#22c55e` | Primary button base |
| `--green-600` | `#16a34a` | Primary button gradient end, links |
| `--green-700` | `#15803d` | Dark green text |
| `--green-300` | `#86efac` | Borders, light accents |
| `--green-200` | `#bbf7d0` | Disabled backgrounds |
| `--gray-900` | `#0f172a` | Headings |
| `--gray-800` | `#1e293b` | Body text |
| `--gray-700` | `#334155` | Labels |
| `--gray-500` | `#64748b` | Subtext, placeholders |
| `--gray-400` | `#94a3b8` | Muted text |
| `--gray-200` | `#e2e8f0` | Borders |
| `--gray-100` | `#f1f5f9` | Dividers, card borders |
| `--off-white` | `#f8fafc` | Page backgrounds |
| `--shadow-green` | `0 4px 14px rgba(34,197,94,.35)` | Green button shadows |

### Typography

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | Inter (Google Fonts) | Body, labels, buttons |
| `--font-display` | Outfit (Google Fonts) | Headings, logo wordmark |

### Spacing & Radius

- Card border-radius: `24px`
- Input border-radius: `10px`
- Button border-radius: `12px`
- Standard form gap: `18px` between fields, `24px` before submit

### Background Pattern

Page backgrounds use a radial green gradient over off-white:
```css
radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34, 197, 94, 0.12) 0%, transparent 70%),
var(--off-white)
```

---

## 7. Coding Conventions — MUST FOLLOW

These rules apply to **every file** in this project without exception.

### ❌ NEVER do this

```tsx
// NO inline styles
<div style={{ color: 'red', padding: '16px' }}>...</div>

// NO hardcoded colors
<button style={{ background: '#22c55e' }}>...</button>

// NO onFocus/onBlur style manipulation
onFocus={(e) => e.target.style.borderColor = 'green'}

// NO duplicated component logic across pages
// Extract to components/
```

### ✅ ALWAYS do this

```tsx
// YES — CSS module classes
<div className={styles.card}>...</div>

// YES — conditional classes for state
<input className={`${styles.input} ${errors.email ? styles.inputError : ''}`} />

// YES — CSS variables for colors
/* In CSS: */
color: var(--green-600);
```

### CSS Module Rule

- Every feature area gets its own CSS module in `styles/`
- Currently: `styles/auth.module.css` (auth pages + dashboard)
- Add new modules as new feature areas grow (e.g., `styles/journal.module.css`)
- Use the design token CSS variables — never hardcode colors

### Component Rule

- Shared UI pieces go in `components/` — never duplicate them across pages
- Auth-specific shared components → `components/auth/`
- Future feature components → `components/<feature>/`

### Animation Rule

- Use **Framer Motion** for all animations
- `motion.div`, `motion.button`, `AnimatePresence` — standard toolkit
- Keep animation values consistent: entry = `opacity: 0, y: 32 → 1, 0`, duration `0.6s`, ease `[0.22, 1, 0.36, 1]`
- Scale hover: `whileHover={{ scale: 1.01 }}`, tap: `whileTap={{ scale: 0.99 }}`

### File Naming

| Type | Convention | Example |
|---|---|---|
| Pages | `page.tsx` in route folder | `app/login/page.tsx` |
| Components | PascalCase `.tsx` | `AuthCard.tsx` |
| CSS Modules | `kebab-case.module.css` | `auth.module.css` |
| Utilities | camelCase `.ts` | `errorHandler.ts` |
| Hooks | `use` prefix `.tsx` | `useAuth.tsx` |

---

## 8. Authentication Flow

### Methods available via `useAuth()` hook

```typescript
const {
  user,            // Firebase User | null
  loading,         // true while auth state is being determined
  signUp,          // (email, password, displayName) → void
  signIn,          // (email, password) → void
  signInGoogle,    // () → void  — Google OAuth popup
  resetPassword,   // (email) → void  — sends reset email
  verifyResetCode, // (oobCode) → string (email)  — validates reset link
  confirmReset,    // (oobCode, newPassword) → void  — applies new password
  logout,          // () → void
} = useAuth();
```

### Auth Pages

| Route | Purpose |
|---|---|
| `/login` | Email/password + Google OAuth sign in |
| `/register` | Create account (email/password + Google OAuth) |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set new password via emailed link (oobCode in URL) |

### Password Reset Flow

1. User submits email on `/forgot-password`
2. `sendPasswordResetEmail` is called with `ActionCodeSettings` — the `url` contains a timestamp: `?t=<ms>`
3. Firebase sends an email whose link goes to `/reset-password` (configured via Firebase Console → Authentication → Email Templates → Password Reset → Customize action URL)
4. On `/reset-password`, the page:
   - Parses `mode`, `oobCode`, `continueUrl` from the URL
   - Checks if `Date.now() - t > 30 minutes` → shows "Link expired"
   - Calls `verifyPasswordResetCode` → shows password form
   - On submit, calls `confirmPasswordReset` → redirects to `/login`

> **Firebase Console setting:** Authentication → Email Templates → Password Reset → Customize action URL → `http://localhost:3000/reset-password` (update to production URL on deploy)

### Firestore User Document

On first sign-in (any method), a user document is created in `users/{uid}`:

```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: Timestamp,
  streak: number,          // current journal streak (days)
  lastEntryDate: null | Timestamp,
  preferences: {
    reminderEnabled: boolean,
    reminderTime: string,  // "HH:MM" format
    theme: "system" | "light" | "dark",
  }
}
```

---

## 9. Firebase Architecture

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Journal entries: users can only access their own
    match /entries/{entryId} {
      allow read, update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Firebase Client Singleton

Always import Firebase services from `@/lib/firebase/config` — never initialize Firebase directly in a component.

```typescript
import { auth, db } from '@/lib/firebase/config';
```

---

## 10. Route Protection

Route protection is handled by **`proxy.ts`** (Next.js middleware).

- Protected routes: `/dashboard` and anything under `/dashboard/*`
- Mechanism: checks for the `__feel_authed` cookie (set client-side in `useAuth.tsx` via `authCookie.ts`)
- Unauthenticated users → redirected to `/login`
- Authenticated users visiting `/login` or `/register` → redirected to `/dashboard`

> **Important:** The middleware file is named `proxy.ts` (not `middleware.ts`) — this is required by the current Next.js 16 configuration. Do not rename it.

---

## 11. Component Patterns

### Shared Auth Components

All auth pages must use these shared components — never re-implement them:

```tsx
import AuthCard from '@/components/auth/AuthCard';         // Card + logo wrapper
import FieldError from '@/components/auth/FieldError';     // Validation error below input
import GoogleIcon from '@/components/auth/GoogleIcon';     // Google "G" SVG
import PasswordStrength from '@/components/auth/PasswordStrength'; // 4-bar strength meter
```

### Form Pattern

Every form in this project uses React Hook Form + Zod:

```tsx
const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormInput>({ resolver: zodResolver(Schema) });
```

Error display:
```tsx
<input className={`${styles.input} ${errors.field ? styles.inputError : ''}`} />
<FieldError message={errors.field?.message} />
```

### Error Handling Pattern

All auth errors are thrown as strings to the calling component:

```typescript
// In useAuth.tsx — errors are mapped to friendly messages
throw getErrorMessage(err); // returns string

// In page component
} catch (err) {
  setServerError((err as AppError).message);
}
```

---

## 12. CSS Module Conventions

### `styles/auth.module.css` — Key Classes

| Class | Usage |
|---|---|
| `.page` | Full-height page wrapper with green gradient background |
| `.card` | White rounded card (460px max-width) |
| `.logoWrap` / `.logoCircle` | Centered green gradient logo circle with 🌿 emoji |
| `.heading` | Page title — centered, 1.625rem, font-display |
| `.subtext` | Subtitle below heading — centered, gray-500 |
| `.googleBtn` | Google OAuth button |
| `.divider` | "or continue with email" separator |
| `.errorBanner` | Server-level error message (red background) |
| `.formGroup` | Form field wrapper (18px bottom margin) |
| `.formGroupLast` | Last field before submit (24px bottom margin) |
| `.label` | Form field label |
| `.labelRow` | Label row with right-aligned "Forgot?" link |
| `.input` | Text input (includes `:focus` and `.inputError` states) |
| `.inputError` | Error state for input (red border, light red background) |
| `.fieldError` | Field-level error text |
| `.submitBtn` | Primary green gradient button |
| `.submitLink` | Primary button styled as a `<Link>` (for non-form navigation) |
| `.outlineBtn` | Secondary outlined button |
| `.backLink` | Centered "← Back to Sign in" link |
| `.footerText` | Bottom "Don't have an account?" text |
| `.link` | Green bold inline link |
| `.termsText` | Small terms notice at bottom of register |
| `.termsPlain` | Plain-text (non-linked) terms/policy reference |
| `.successBadge` | Green-tinted info box (email sent confirmation) |
| `.successIconCircle` | Centered emoji circle for success states |
| `.spinner` | CSS loading spinner |
| `.strengthBars` / `.strengthBar` | Password strength bar container/segments |

### `styles/navbar.module.css` — Key Classes

| Class | Usage |
|---|---|
| `.logoLink` | Flex row wrapping logo circle + wordmark |
| `.logoCircle` | Green gradient circle with 🌿 emoji |
| `.logoWordmark` | "Feel" text in display font |
| `.authButtons` | Flex row for Sign in + Get started buttons |
| `.signInBtn` / `.getStartedBtn` | Size overrides on top of `btn-outline` / `btn-primary` |
| `.avatarBtn` | Logged-in user avatar circle (initials) |
| `.indicator` | Sliding tab underline bar |

### `styles/dashboard.module.css` — Key Classes

| Class | Usage |
|---|---|
| `.dashNav` | Smart fixed navbar — `transform: translateY(-100%)` when `.hidden` |
| `.hidden` | Applied when user scrolls down — slides nav off screen |
| `.elevated` | Applied when scrolled > 10px — adds shadow |
| `.profileWrap` | Relative container for avatar + dropdown |
| `.avatarBtn` | Initials avatar button (dashboard version) |
| `.dropdown` | Animated profile dropdown card |
| `.dropdownHeader` / `.dropdownName` / `.dropdownEmail` | Dropdown user info |
| `.dropdownItem` | Dropdown menu button row |
| `.dropdownItem.danger` | Red destructive action (Sign out) |
| `.shell` | Full-height page wrapper with `padding-top: var(--nav-height)` |
| `.tabContent` | Max-width 720px centered content area |
| `.sectionHeading` / `.sectionSubtext` | Tab panel title and subtitle |
| `.entryCard` | White card wrapping the journal textarea |
| `.entryTextarea` | 280-char journal input |
| `.entryFooter` | Row with char count + save button |
| `.charCount` / `.charCountOver` | Character countdown (red when over limit) |
| `.moodCard` | Card containing the mood picker |
| `.moodGrid` | Flex row of mood buttons |
| `.moodBtn` / `.moodActive` | Individual mood option, active state |
| `.moodEmoji` / `.moodText` | Emoji + label inside mood button |
| `.emptyState` | Centered placeholder card for empty tabs |
| `.streakBadge` | Green pill showing current streak |
| `.saveBtn` | Size override for the save entry button |

---

## 13. Feature Roadmap

### ✅ Completed
- Landing page (public) with animated tabs, hero section, features, mood section, stats
- Authentication: email/password sign up + sign in
- Authentication: Google OAuth
- Authentication: forgot password + custom reset page (30-min link expiry)
- Route protection via middleware (`proxy.ts`)
- Firestore user document initialization on first login
- Shared CSS module design system (`auth.module.css`, `navbar.module.css`, `dashboard.module.css`)
- **Dashboard** — 4-tab layout (Today, Timeline, Calendar, Stats)
  - Smart navbar: hides on scroll down, reappears on scroll up
  - Profile avatar with animated dropdown (Sign out, Settings)
  - Animated tab indicator (spring physics)
  - Logo links to `/dashboard` when logged in, `/` when on landing page
- **Today tab** — journal entry textarea (280-char limit + live count), mood picker (5 moods), save flow
- Empty states for Timeline, Calendar, Stats tabs

### 🚧 In Progress / Next
- **Firestore CRUD** — persist journal entries to `entries/{entryId}` collection
- **Timeline** — fetch and display past entries chronologically
- **Calendar** — streak/consistency heatmap
- **Stats** — mood frequency chart, entry count, longest streak
- **Keyword Search** — search through past entries
- **Data Export** — download entries as JSON/CSV
- **Profile & Preferences** — reminder settings, theme toggle

---

## Contributing

1. **Read this README fully** before writing any code
2. Follow all conventions in Section 7 — no exceptions
3. Use CSS module classes, never inline styles
4. Use the design tokens from `globals.css`, never hardcode colors
5. Extract shared UI into `components/` — don't duplicate across pages
6. All auth logic goes through `useAuth()` — don't call Firebase directly from pages
7. Test auth flows end-to-end before submitting a PR
