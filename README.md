# Welcome to Nyansapo App 👋


## Project Overview

This app showcases a simple classroom performance dashboard built with Expo Router and React Native. It includes:

- Class-level performance overview (`app/class-performance.tsx`)
- Student detail view with PDF export (`app/student/[id].tsx`)
- Shared UI components (`components/`), mock data (`assets/data.json`)

The app uses file-based routing via `expo-router` with `app/_layout.tsx` defining the stack. The initial route is `class-performance`.

## Design Decisions

- __File-based routing (Expo Router)__: Simplifies navigation and keeps screens colocated with routes for maintainability.
- __Typed domain model__: `Strand`, `Student` types ensure safer rendering and filtering logic.
- __Mock data via Metro bundler__: `require("@/assets/data.json")` keeps demo data local and fast to iterate.
- __Composable UI__: Reusable `ProgressBar`, `MasteryKey`, and `StudentListItem` promote consistency.
- __On-demand features__: PDF generation uses dynamic imports (`expo-print`, `expo-sharing`) to avoid platform issues when modules aren’t available.

## Assumptions

- Data shape matches `assets/data.json` and includes class profile plus students with strand-level fields.
- Competency codes are `BE | AE | ME | EE` and map to color tokens in `MasteryKey`.
- Filtering UX targets quick demos: simple modal with three toggles and a text query.
- PDF export is a convenience for sharing; long-term storage is not required in this demo.

## Setup

1) Install dependencies

```bash
npm install
```

2) Install native modules used by features

```bash
npx expo install expo-print expo-sharing
```

3) Start the app

```bash
npx expo start
```

Open in Expo Go, simulator, or a development build.

## How to Test

- __Navigate__: App opens to `Class Performance`. Tap a student to view their details.
- __Search & Filter__: Use the search bar and filter modal to refine visible students per strand.
- __PDF Export__: On a student screen, tap “Download” to generate a PDF. If sharing is available, the share sheet opens; otherwise, the saved path is shown.
- __Routing__: Invalid routes are handled by the `+not-found.tsx` screen.

### Manual Tests Checklist

- __List rendering__: Each strand shows a progress bar and a list of students matching filters.
- __Filter logic__: “Needs Support” => BE. “On Track” => AE/ME. “Exceeds” => EE. Combine with search.
- __Edge cases__: Empty search or filters produce fewer or zero results without errors. Student without data shows fallback state.
- __PDF__: Works on native where supported; on unsupported platforms an alert shows the file path or a failure message.

## Technologies Used and Why

- __Expo Router__: First-class file-based navigation for React Native and web. Reduces boilerplate and aligns with modern routing patterns.
- __React Native + Expo__: Cross-platform development with strong tooling and over-the-air updates.
- __TypeScript__: Safer refactors and better IDE support.
- __expo-print / expo-sharing__: Simple, reliable PDF generation and cross-platform sharing with minimal native code.

## Error Handling & State Management Best Practices

- __Component-level try/catch__: As used in the `onDownload()` flow to surface actionable errors via `Alert.alert()`.
- __Error Boundaries (Expo Router)__: You can add an `ErrorBoundary` export to any route to catch render-time errors and display a friendly fallback:
  - Docs: https://docs.expo.dev/router/error-handling/
  - Source: https://github.com/expo/expo/blob/main/docs/pages/router/error-handling.mdx
- __Route-level 404s__: `+not-found.tsx` handles unmatched routes gracefully.
- __State management__: Local UI state uses `useState` and derived views use `useMemo` for simple, predictable state.
  - For larger apps, consider a store (e.g., Zustand, Redux) and query libraries (e.g., TanStack Query) to separate server cache from UI state.
- __Input validation__: Guard against undefined data fields (`Math.max(0, Math.min(1, ...))`) to keep visuals stable.
- __Platform-aware APIs__: Dynamic `import()` for `expo-print` and `expo-sharing` prevents web/runtime errors where modules are unavailable.

## Project Structure

- `app/_layout.tsx`: Navigation stack and theming.
- `app/class-performance.tsx`: Class overview with search and filters.
- `app/student/[id].tsx`: Student detail view and PDF export.
- `components/`: Reusable UI.
- `assets/data.json`: Mock dataset.

## Extensibility

- __Data fetching__: Replace local JSON with real APIs; introduce TanStack Query for caching and retries.
- __Theming__: Expand color tokens and dark mode with `ThemeProvider`.
- __Analytics/Logging__: Add structured logs and crash reporting (e.g., Sentry) for error observability.

## Troubleshooting

- __Module not found: expo-print / expo-sharing__:
  - Run `npx expo install expo-print expo-sharing` and restart the dev server.
- __Type errors on imports__:
  - Ensure path aliases (`@`) are set in `tsconfig.json` and Metro config if customized.
- __Blank screen while fonts load__:
  - `app/_layout.tsx` returns `null` until fonts load in dev; this is expected.
