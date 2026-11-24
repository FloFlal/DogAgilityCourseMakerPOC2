# Guide de contribution

Merci de votre intérêt pour le Dog Agility Course Maker ! Ce document décrit
comment installer le projet, développer dessus et respecter ses conventions.

## Installation

Prérequis : Node.js (>= 20) et npm.

```bash
git clone https://github.com/FloFlal/DogAgilityCourseMakerPOC2.git
cd DogAgilityCourseMakerPOC2/DogAgilityCourseMakerPoc2
npm install
npm run dev
```

Le serveur de développement démarre sur http://localhost:5173.

Vérifier son travail avant de soumettre :

```bash
npx vitest run          # suite de tests complète
npm run test:coverage   # couverture (seuils : 80/80/80/70)
npm run lint            # ESLint, zéro erreur et zéro avertissement attendus
npm run build           # tsc -b + build de production
```

## Workflow de contribution

1. Ouvrez (ou reprenez) une issue décrivant le problème ou l'amélioration.
2. Créez une branche dédiée à partir de `main` à jour
   (`git fetch origin main && git checkout -b <nom-de-branche> origin/main`).
3. Développez avec des commits atomiques en anglais
   (voir [conventions de commit](#conventions-de-commit)).
4. Vérifiez tests, lint et build.
5. Ouvrez une pull request vers `main` : le CI doit passer et un membre du
   projet relit le code.
6. Après relecture, la pull request est fusionnée (squash) dans `main`.

## Conventions de code

- **Langue** : commentaires et JSDoc du code source en anglais ;
  identificateurs en anglais (US-013) — les PR, issues et commits **nouveaux**
  sont rédigés en anglais (les artifacts antérieurs restent en français).
- **Fichiers** : noms en camelCase, à l'exception des composants React
  existants déjà nommés en lowerCamelCase (conserver la convention locale).
- **TypeScript strict** :
  - `verbatimModuleSyntax` : importer les types avec `import type` ;
  - `erasableSyntaxOnly` : pas d'enum ni de namespace, préférer les unions
    de littéraux et `as const` ;
  - aucun `any` : typer explicitement les données publiques ;
  - utiliser `React.ReactElement` plutôt que `JSX.Element`.
- **Nom des callbacks** : `handle*` pour les callbacks internes et les
  retours de hooks, `on*` pour les props d'événements.
- **Indentation** : suivre celle du fichier modifié (le projet mélange 2
  espaces dans `src/obstacles` et 4 espaces ailleurs) ; ne pas reformater
  des lignes non touchées.
- **Dépendances** : n'en ajouter que si nécessaire et motivé dans la PR.

## Architecture

- **Store Zustand découpé en slices** (`src/store/slices/`) : `drawing`
  (obstacles et sélection), `tools` (préférences de dessin), `course`
  (import/export). Les types se composent dans `storeTypes.ts`.
- **Sélecteurs** (`src/store/selectors.ts`) : composer le store à travers
  des sélecteurs nommés (`useDrawingStore(selectObstacles)`) ; les données
  dérivées utilisent `createSelector` (mémoïsation).
- **Service pur** (`src/services/courseService.ts`) : la logique
  d'import/export est pure, sans store ni UI, ce qui la rend aisément
  testable.
- **Schémas Zod** (`src/schemas/courseSchema.ts`) : toute donnée importée
  est validée par `validateCourseData`.
- **Couches canvas** (`src/components/canvas/`) : le rendu est découpé en
  couches (quadrillage, obstacles, transformer) et les composants
  d'obstacles (`src/obstacles/`) restent purement visuels.

## Tests

- Runner : **Vitest** (jsdom, `globals: true`), assertions avec
  `@testing-library/react` et `@testing-library/user-event`.
- **react-konva doit être mocké** dans les tests rendant du canvas Konva
  (voir `src/__tests__/mocks/reactKonva.tsx`) : chaque primitive Konva
  devient une `div` avec des attributs `data-testid`/`data-id`.
- Le compteur global de couverture impose **80 % de lignes, statements et
  fonctions, 70 % de branches** : `npx vitest run --coverage` échoue si les
  seuils ne sont pas atteints.
- Préférer des tests ciblés pour couvrir les branches plutôt que baisser
  les seuils.

## Internationalisation

- Tout texte visible doit passer par la fonction de traduction
  `t('namespace.cle')` (`useTranslation` de react-i18next).
- Les traductions vivent dans `src/i18n/locales/fr.ts` et `en.ts` :
  toute nouvelle clé est ajoutée dans les **deux** fichiers.
- Les libellés d'accessibilité (`aria-label`, textes `sr-only`) sont
  également traduits.

## Accessibilité

- Tout élément interactif est atteignable au clavier (le canvas gère
  Escape, Suppr et les flèches via `useCanvasKeyboard`).
- Les groupes de contrôle utilisent `role="group"` avec un `aria-label`,
  les boutons d'état exposent `aria-pressed`, les icônes décoratives sont
  `aria-hidden`.
- Les états de focus visibles (`focus-visible:outline-*`) sont conservés.

## Conventions de commit

Messages en anglais, au format :

```
type(US-0XX): description courte
```

avec `type` parmi `feat`, `fix`, `refactor`, `test`, `docs`, `chore`,
et le détail des changements en liste à puces dans le corps du message.

## Checklist de pull request

La checklist complète est maintenue dans le [template de pull
request](.github/PULL_REQUEST_TEMPLATE.md) et pré-remplit automatiquement
la description de chaque nouvelle PR : il suffit de cocher les cases avant
de demander la relecture.

Les vérifications testables (`lint`, tests et couverture, `build`) sont
de plus exécutées automatiquement par le pipeline CI (`ci.yml`) sur chaque
pull request et chaque push vers `main`.
