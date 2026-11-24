[🇫🇷 Français](README.fr.md) | 🇬🇧 **English**

# DogAgilityCourseMakerPOC2

This application is a proof of concept (POC) used to select the technologies
for a future dog agility course designer — open source and community driven.

**This repository is not meant to become the final application.**

**Try it online: [https://floflal.github.io/DogAgilityCourseMakerPOC2/](https://floflal.github.io/DogAgilityCourseMakerPOC2/)** (deployed automatically from `main`, see [Deployment](#deployment)).

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React 19 + TypeScript + Vite |
| 2D drawing | Konva + react-konva |
| State management | Zustand (sliced store, memoized selectors) |
| Styling | TailwindCSS 4 |
| Validation | Zod (course import schemas) |
| Internationalization | i18next + react-i18next (French / English) |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Testing | Vitest + @testing-library/react (jsdom), coverage with @vitest/coverage-v8 |

## The application

This POC focuses on the following aspects:

- A course designer to place, move, resize and rotate obstacles that comply
  with the FCI regulations.
- A settings view to change the color and size of obstacles.
- An import/export feature to save the course to a file (`.dacm.json`),
  share it and import it back.
- An accessible (keyboard navigation, ARIA) and international interface
  (English by default & browser-language detection, French/English switch
  without reloading the page; the persisted choice always wins).

### Main interactions

- Click a tool in the sidebar to arm it (clicking the active tool again
  disarms it), then click the canvas to place the obstacle with its
  regulation dimensions per type. The placed obstacle is *not* selected
  automatically: click it to select it.
- Click an obstacle to select it: this disarms the placement tool (tool and
  selection are mutually exclusive). Escape deselects the active item: the
  selected obstacle, otherwise the tool.
- An information banner at the bottom of the drawing area permanently shows
  the number of placed obstacles and, when a selection exists, the type and
  position (x/y in px) of the selected obstacle.

## Installation and development

Requirements: Node.js (>= 20) and npm.

```bash
# clone the project and install the dependencies
git clone https://github.com/FloFlal/DogAgilityCourseMakerPOC2.git
cd DogAgilityCourseMakerPOC2/DogAgilityCourseMakerPoc2
npm install

# start the development server
npm run dev
```

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | TypeScript check (`tsc -b`) then production build |
| `npm run preview` | preview of the production build |
| `npm run lint` | ESLint across the whole project |
| `npm test` | Vitest tests in watch mode |
| `npx vitest run` | one-shot run of the whole test suite |
| `npm run test:coverage` | tests with coverage report (thresholds: 80% lines/statements/functions, 70% branches) |

## Project structure

```
DogAgilityCourseMakerPoc2/src/
├── components/         # Sidebar, CanvasArea, LanguageSwitcher
│   └── canvas/         # Konva layers (grid, obstacles, transformer)
├── hooks/              # React hooks (drag, transform, keyboard, dimensions)
├── i18n/               # internationalization (fr / en locales)
├── obstacles/          # rendering of each obstacle (Jump, Seesaw, DogWalk, AFrame)
├── schemas/            # Zod schemas validating courses
├── services/           # pure logic (import/export, store- and UI-independent)
├── store/              # Zustand store (slices) + memoized selectors
├── types/              # shared TypeScript types
└── __tests__/          # unit and integration tests (Vitest)
```

## Deployment

The application is published on **GitHub Pages** on every push to `main`,
through the
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) workflow:

1. dependency installation then production build on Node 26;
2. publication of the `dist` content with the official
   [`upload-pages-artifact`](https://github.com/actions/upload-pages-artifact)
   and [`deploy-pages`](https://github.com/actions/deploy-pages) actions;
3. the application URL is visible in the `github-pages` environment of the
repository (Settings → Environments).

The Pages build uses a specific public base
(`VITE_BASE=/DogAgilityCourseMakerPOC2/`, consumed by `vite.config.ts`) —
in local development the default `/` base is still used.

> One-time prerequisite (manual repository setting):
> Settings → Pages → Source "GitHub Actions".

## Contributing

To contribute, read the [contributing guide](CONTRIBUTING.md).
In short, two options:

- You cannot or do not want to code: open an issue explaining your problem
  (bug, improvement, idea, etc.) and how you envision the evolution of the
  application.
- You want to code: open an issue, fork the project, create a branch to
  develop your idea, develop and test it, then open a pull request on the
  main project for review.
