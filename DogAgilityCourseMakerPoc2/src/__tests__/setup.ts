// Setup for Vitest tests
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Polyfill localStorage when the runtime does not provide it (Node 26+ without --localstorage-file)
import { installLocalStoragePolyfillIfNeeded } from './mocks/localStorage';

// The suite is calibrated on French labels: seed a persisted "fr" choice
// BEFORE i18next initialization (the application itself starts in English
// by default — see US-016).
installLocalStoragePolyfillIfNeeded(window);
window.localStorage.setItem('dogagility.language', 'fr');

// Initialize i18next (dynamic import: respects ordering with the seed above)
await import('../i18n');

// crypto.randomUUID mock for the tests
beforeAll(() => {
  if (!globalThis.crypto) {
    // @ts-expect-error - Mocking global crypto
    globalThis.crypto = {
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
    };
  } else {
    // If crypto already exists (in jsdom), mock randomUUID
    globalThis.crypto.randomUUID = () => '00000000-0000-0000-0000-000000000000';
  }
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  // Final cleanup
  vi.restoreAllMocks();
});
