import { describe, expect, it } from 'vitest';
import {
    createMemoryStorage,
    installLocalStoragePolyfillIfNeeded,
} from './localStorage';
import type { MemoryStorage } from './localStorage';

type StorageHost = { localStorage?: unknown };

describe('installLocalStoragePolyfillIfNeeded', () => {
    it("ne fait rien si un storage utilisable est déjà présent", () => {
        const host: StorageHost = { localStorage: createMemoryStorage() };

        expect(installLocalStoragePolyfillIfNeeded(host)).toBe(false);
        expect((host.localStorage as MemoryStorage).getItem('clé')).toBeNull();
    });

    it('installe un polyfill fonctionnel si localStorage est absent', () => {
        const host: StorageHost = {};

        expect(installLocalStoragePolyfillIfNeeded(host)).toBe(true);

        const storage = host.localStorage as MemoryStorage;

        storage.setItem('dogagility.language', 'en');
        expect(storage.getItem('dogagility.language')).toBe('en');

        storage.removeItem('dogagility.language');
        expect(storage.getItem('dogagility.language')).toBeNull();
    });

    it('cloisonne les données entre deux installations distinctes', () => {
        const hostA: StorageHost = {};
        const hostB: StorageHost = {};

        installLocalStoragePolyfillIfNeeded(hostA);
        installLocalStoragePolyfillIfNeeded(hostB);

        (hostA.localStorage as MemoryStorage).setItem('a', '1');

        expect((hostB.localStorage as MemoryStorage).getItem('a')).toBeNull();
    });

    it("retourne false si l'accès à localStorage échoue (getter en erreur)", () => {
        const host: StorageHost = {};

        Object.defineProperty(host, 'localStorage', {
            configurable: false,
            get: () => {
                throw new Error('SecurityError simulé');
            },
        });

        expect(installLocalStoragePolyfillIfNeeded(host)).toBe(false);
    });
});
