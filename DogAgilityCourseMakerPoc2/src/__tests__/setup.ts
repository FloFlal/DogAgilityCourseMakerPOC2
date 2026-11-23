// Setup for Vitest tests
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// i18next initialization for translated components
import '../i18n';

// localStorage polyfill when the runtime does not provide it (Node 26+ without --localstorage-file)
import { installLocalStoragePolyfillIfNeeded } from './mocks/localStorage';

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

  installLocalStoragePolyfillIfNeeded(window);
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  // Nettoyage final
  vi.restoreAllMocks();
});
