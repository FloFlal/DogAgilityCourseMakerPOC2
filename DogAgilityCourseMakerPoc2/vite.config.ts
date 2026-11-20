import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base publique des assets. Surchargée par le workflow de déploiement GitHub
// Pages (VITE_BASE, cf. .github/workflows/deploy.yml) ; par défaut '/' pour
// le développement local (npm run dev) et npm run preview.
const base: string = process.env.VITE_BASE ?? '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
    react()
  ],
})
