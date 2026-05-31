# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev       # or: yarn dev

# Build & production
npm run build
npm run start

# Lint
npm run lint
```

No test framework is configured.

## Architecture

This is a **Next.js 14 App Router** admin dashboard built on the [TailAdmin](https://tailadmin.com/) free template, using React 18, TypeScript, and Tailwind CSS.

### Page layout flow

Every page follows this pattern:
1. `src/app/layout.tsx` (root) — client component; shows a 1-second `<Loader>` on initial render, then renders children
2. Each page wraps its content in `<DefaultLayout>` (`src/components/Layouts/DefaultLayout.tsx`)
3. `DefaultLayout` composes `<Sidebar>` + `<Header>` + a `<main>` content area

### Key directories

- `src/app/` — App Router pages; each `page.tsx` imports a component from `src/components/` and wraps it in `DefaultLayout`
- `src/components/` — UI components grouped by feature (Charts, Dashboard, Header, Sidebar, Tables, etc.)
- `src/hooks/` — `useLocalStorage` (generic) and `useColorMode` (reads/writes `color-theme` key to localStorage)
- `src/types/` — TypeScript interfaces for data shapes (brand, product, chat, etc.)
- `src/css/` — `satoshi.css` (Satoshi font face declarations) and `style.css` (global overrides)

### Dark mode

Dark mode uses Tailwind's `class` strategy. `useColorMode` adds/removes the `dark` class on `document.body` and persists the preference in localStorage. The `<body>` in `layout.tsx` uses `suppressHydrationWarning` to avoid SSR mismatch from the localStorage read.

### Sidebar navigation

Menu items are defined as a static `menuGroups` array at the top of `src/components/Sidebar/index.tsx`. To add a new route, append an entry there. The active item is tracked via `useLocalStorage("selectedMenu", ...)`.

### Browser-only components

Components that depend on browser APIs (`MapOne`, `ChartThree`) are imported with `dynamic(..., { ssr: false })` in `src/components/Dashboard/E-commerce.tsx`. Apply the same pattern to any new component that uses `window` or DOM APIs at import time.

### Path alias

`@` maps to `src/` (configured in `tsconfig.json`). Use `@/components/...`, `@/hooks/...`, etc.

### Tailwind customization

`tailwind.config.ts` extends the default theme with the `Satoshi` font family, a large set of custom spacing/size tokens (e.g. `w-72.5`, `p-6.5`), custom color tokens (`primary`, `bodydark`, `boxdark`, `meta-*`, etc.), and extended z-index values up to `999999`. Use these existing tokens rather than arbitrary values.
