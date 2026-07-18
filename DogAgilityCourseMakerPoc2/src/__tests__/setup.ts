// Setup pour les tests Vitest
import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock de crypto.randomUUID pour les tests
beforeAll(() => {
  // @ts-expect-error - Mocking global crypto
  global.crypto = {
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
  };
});

// Nettoyage après chaque test
afterEach(() => {
  // Réinitialiser les mocks si nécessaire
});

afterAll(() => {
  // Nettoyage final
});
