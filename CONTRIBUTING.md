**English** | [🇫🇷 Français](CONTRIBUTING.fr.md)

# Contributing guide

Thank you for your interest in the Dog Agility Course Maker! This document
describes how to set the project up, develop on it and follow its
conventions.

## Installation

Requirements: Node.js (>= 20) and npm.

```bash
git clone https://github.com/FloFlal/DogAgilityCourseMakerPOC2.git
cd DogAgilityCourseMakerPOC2/DogAgilityCourseMakerPoc2
npm install
npm run dev
```

The development server starts on http://localhost:5173.

Check your work before submitting:

```bash
npx vitest run          # full test suite
npm run test:coverage   # coverage (thresholds: 80/80/80/70)
npm run lint            # ESLint, zero errors and zero warnings expected
npm run build           # tsc -b + production build
```

## Contribution workflow

1. Open (or pick up) an issue describing the problem or the improvement.
2. Create a dedicated branch from an up-to-date `main`
   (`git fetch origin main && git checkout -b <branch-name> origin/main`).
3. Develop with atomic commits in English
   (see [commit conventions](#commit-conventions)).
4. Run tests, lint and build.
5. Open a pull request towards `main`: CI must pass and a project member
   reviews the code.
6. After review, the pull request is merged (squash) into `main`.

## Code conventions

- **Language**: source-code comments and JSDoc in English (US-013);
  identifiers in English. **New** issues, PRs and commit messages are
  written in English (existing artifacts remain in French).
- **Files**: camelCase names, except for existing React components already
  named in lowerCamelCase (keep the local convention).
- **Strict TypeScript**:
  - `verbatimModuleSyntax`: import types with `import type`;
  - `erasableSyntaxOnly`: no enum or namespace, prefer literal unions and
    `as const`;
  - no `any`: type public data explicitly;
  - use `React.ReactElement` rather than `JSX.Element`.
- **Callback naming**: `handle*` for internal callbacks and hook returns,
  `on*` for event props.
- **Indentation**: follow the file you modify (the project mixes 2-space
  indentation in `src/obstacles` and 4 spaces elsewhere); do not reformat
  untouched lines.
- **Dependencies**: only add them when necessary and justify in the PR.

## Architecture

- **Zustand store split into slices** (`src/store/slices/`): `drawing`
  (obstacles and selection), `tools` (drawing preferences), `course`
  (import/export). Slice types are composed in `storeTypes.ts`.
- **Selectors** (`src/store/selectors.ts`): consume the store through named
  selectors (`useDrawingStore(selectObstacles)`); derived data uses
  `createSelector` (memoization).
- **Pure service** (`src/services/courseService.ts`): the import/export
  logic is pure, without store or UI, which makes it easy to test.
- **Zod schemas** (`src/schemas/courseSchema.ts`): every imported dataset
  is validated by `validateCourseData`.
- **Canvas layers** (`src/components/canvas/`): rendering is split into
  layers (grid, obstacles, transformer) and obstacle components
  (`src/obstacles/`) stay purely visual.

## Tests

- Runner: **Vitest** (jsdom, `globals: true`), assertions with
  `@testing-library/react` and `@testing-library/user-event`.
- **react-konva must be mocked** in tests rendering Konva canvases
  (see `src/__tests__/mocks/reactKonva.tsx`): every Konva primitive becomes
  a `div` with `data-testid`/`data-id` attributes.
- The global coverage threshold enforces **80% lines, statements and
  functions, 70% branches**: `npx vitest run --coverage` fails when the
  thresholds are not met.
- Prefer targeted tests to cover branches rather than lowering thresholds.

## Internationalization

- Every visible text must go through the translation function
  `t('namespace.key')` (`useTranslation` from react-i18next).
- Translations live in `src/i18n/locales/fr.ts` and `en.ts`: every new key
  is added to **both** files.
- Accessibility labels (`aria-label`, `sr-only` texts) are translated too.
- The application defaults to English with browser-language detection; the
  persisted user choice (localStorage) always takes precedence (US-016).

## Accessibility

- Every interactive element is keyboard-reachable (the canvas handles
  Escape, Delete and the arrows via `useCanvasKeyboard`).
- Control groups use `role="group"` with an `aria-label`, state buttons
  expose `aria-pressed`, decorative icons are `aria-hidden`.
- Visible focus states (`focus-visible:outline-*`) are preserved.

## Commit conventions

Messages in English, with the format:

```
type(US-0XX): short description
```

where `type` is one of `feat`, `fix`, `refactor`, `test`, `docs`, `chore`,
and the change details as a bullet list in the message body.

## Pull request checklist

The full checklist is maintained in the [pull request
template](.github/PULL_REQUEST_TEMPLATE.md) and automatically pre-fills the
description of every new PR: just tick the boxes before requesting review.

The checkable gates (`lint`, tests and coverage, `build`) are additionally
run automatically by the CI pipeline (`ci.yml`) on every pull request and
every push to `main`.
