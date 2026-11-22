# DogAgilityCourseMakerPOC2

Cette application est une preuve de conception (POC) permettant de choisir
les technologies d'un futur designer de parcours d'agility canine, open
source et maintenu par la communauté.

**Ce dépôt n'a pas vocation à être l'application finale.**

**Essayer en ligne : [https://floflal.github.io/DogAgilityCourseMakerPOC2/](https://floflal.github.io/DogAgilityCourseMakerPOC2/)** (déployée automatiquement depuis `main`, voir [Déploiement](#déploiement)).

## Stack technique

| Domaine | Technologie |
| --- | --- |
| UI | React 19 + TypeScript + Vite |
| Dessin 2D | Konva + react-konva |
| Gestion d'état | Zustand (store découpé en slices, sélecteurs mémoïsés) |
| Styles | TailwindCSS 4 |
| Validation | Zod (schémas d'import de parcours) |
| Internationalisation | i18next + react-i18next (français / anglais) |
| Notifications | react-hot-toast |
| Icônes | lucide-react |
| Tests | Vitest + @testing-library/react (jsdom), couverture @vitest/coverage-v8 |

## L'application

Ce POC se concentre sur les aspects suivants :

- Un designer de parcours permettant de poser, déplacer, redimensionner et
  faire pivoter des obstacles conformes à la réglementation FCI.
- Une vue de réglages permettant de changer la couleur et la taille des
  obstacles.
- Une fonctionnalité d'import/export permettant de sauvegarder le parcours
  dans un fichier (`.dacm.json`), de le partager et de le réimporter.
- Une interface accessible (navigation clavier, ARIA) et internationale
  (changement de langue français/anglais sans rechargement de la page).

### Interactions principales

- Cliquez sur un outil dans la barre latérale pour l'armer (re-cliquer sur
  l'outil actif le désactive), puis cliquez sur le canvas pour y poser
  l'obstacle, aux dimensions réglementaires par type.
- Cliquez sur un obstacle pour le sélectionner : cela désactive l'outil de
  pose (outil et sélection sont mutuellement exclusifs). Échap désélectionne
  l'élément actif : l'obstacle sélectionné, sinon l'outil.

## Installation et développement

Prérequis : Node.js (>= 20) et npm.

```bash
# récupérer le projet et installer les dépendances
git clone https://github.com/FloFlal/DogAgilityCourseMakerPOC2.git
cd DogAgilityCourseMakerPOC2/DogAgilityCourseMakerPoc2
npm install

# lancer le serveur de développement
npm run dev
```

### Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | serveur de développement Vite |
| `npm run build` | vérification TypeScript (`tsc -b`) puis build de production |
| `npm run preview` | prévisualisation du build de production |
| `npm run lint` | analyse ESLint de tout le projet |
| `npm test` | tests Vitest en mode watch |
| `npx vitest run` | exécution unique de toute la suite de tests |
| `npm run test:coverage` | tests avec rapport de couverture (seuils : 80 % lignes/statements/fonctions, 70 % branches) |

## Structure du projet

```
DogAgilityCourseMakerPoc2/src/
├── components/         # Sidebar, CanvasArea, LanguageSwitcher
│   └── canvas/         # couches Konva (quadrillage, obstacles, transformer)
├── hooks/              # hooks React (drag, transformation, clavier, dimensions)
├── i18n/               # internationalisation (locales fr / en)
├── obstacles/          # rendu de chaque obstacle (Jump, Seesaw, DogWalk, AFrame)
├── schemas/            # schémas Zod de validation des parcours
├── services/           # logique pure (import/export, indépendante du store et de l'UI)
├── store/              # store Zustand (slices) + sélecteurs mémoïsés
├── types/              # types TypeScript partagés
└── __tests__/          # tests unitaires et d'intégration (Vitest)
```

## Déploiement

L'application est publiée sur **GitHub Pages** à chaque push sur `main`, via le
workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) :

1. installation des dépendances puis build de production sur Node 26 ;
2. publication du contenu de `dist` avec les actions officielles
   [`upload-pages-artifact`](https://github.com/actions/upload-pages-artifact)
   et [`deploy-pages`](https://github.com/actions/deploy-pages) ;
3. l'URL de l'application est visible dans l'environnement `github-pages` du
dépôt (Settings → Environments).

Le build Pages utilise une base publique spécifique
(`VITE_BASE=/DogAgilityCourseMakerPOC2/`, consommée par `vite.config.ts`) —
en développement local, la base par défaut `/` reste utilisée.

> Prérequis (une seule fois, réglage manuel du dépôt) :
> Settings → Pages → Source « GitHub Actions ».

## Contribution

Pour contribuer, consultez le [guide de contribution](CONTRIBUTING.md).
En résumé, deux possibilités :

- Vous ne savez pas ou ne voulez pas coder : créez une issue pour expliquer
  votre problème (bug, amélioration, idée, etc.) et comment vous imaginez
  l'évolution de l'application.
- Vous voulez coder : créez une issue, forkez le projet, créez une branche
  pour développer votre idée, faites le développement et les tests, puis
  ouvrez une pull request sur le projet principal pour qu'un membre la
  relise.
