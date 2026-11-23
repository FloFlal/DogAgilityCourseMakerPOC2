// Setup pour les tests Vitest
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Polyfill localStorage si le runtime ne le fournit pas (Node 26+ sans --localstorage-file)
import { installLocalStoragePolyfillIfNeeded } from './mocks/localStorage';

// La suite est calibrée sur les libellés français : on sème un choix
// persisté « fr » AVANT l'initialisation i18next (l'application elle-même
// démarre en anglais par défaut — voir US-016).
installLocalStoragePolyfillIfNeeded(window);
window.localStorage.setItem('dogagility.language', 'fr');

// Initialisation i18next (import dynamique : respecte l'ordre avec le seed au-dessus)
await import('../i18n');

// Mock de crypto.randomUUID pour les tests
beforeAll(() => {
  if (!globalThis.crypto) {
    // @ts-expect-error - Mocking global crypto
    globalThis.crypto = {
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
    };
  } else {
    // Si crypto existe déjà (dans jsdom), on mock randomUUID
    globalThis.crypto.randomUUID = () => '00000000-0000-0000-0000-000000000000';
  }
});

// Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  // Nettoyage final
  vi.restoreAllMocks();
});
