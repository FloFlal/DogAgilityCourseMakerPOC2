// Setup pour les tests Vitest
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Initialisation i18next (français par défaut) pour les composants traduits
import '../i18n';

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
