/**
 * In-memory storage used as a fallback polyfill in tests.
 * Replicates the Storage interface semantics (key/value pairs of
 * characters, `getItem` returning `null` for a missing key).
 */
export type MemoryStorage = Pick<
    Storage,
    'getItem' | 'setItem' | 'removeItem' | 'clear'
>;

/**
 * Creates an independent in-memory storage, isolated between installations.
 * @returns An object conforming to the MemoryStorage sub-interface (getItem, setItem, removeItem, clear)
 */
export function createMemoryStorage(): MemoryStorage {
    const store = new Map<string, string>();

    return {
        getItem: (key: string): string | null => {
            const value = store.get(key);

            return value === undefined ? null : value;
        },
        setItem: (key: string, value: string): void => {
            store.set(key, String(value));
        },
        removeItem: (key: string): void => {
            store.delete(key);
        },
        clear: (): void => {
            store.clear();
        },
    };
}

type StorageHost = { localStorage?: unknown };

/**
 * Checks whether a value properly implements the expected Storage interface.
 * @param value - Value to inspect (may be undefined or an incomplete object)
 * @returns True if the value implements the four MemoryStorage methods
 */
function isUsableStorage(value: unknown): value is MemoryStorage {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as Partial<Record<keyof MemoryStorage, unknown>>;

    return (
        typeof candidate.getItem === 'function' &&
        typeof candidate.setItem === 'function' &&
        typeof candidate.removeItem === 'function' &&
        typeof candidate.clear === 'function'
    );
}

/**
 * Installs an in-memory polyfill when `localStorage` is unavailable on the host.
 * Node 26+ exposes an experimental global `localStorage` which, without the
 * `--localstorage-file` option, hides the localStorage provided by jsdom in
 * the Vitest environment: this polyfill then guarantees a real
 * (getItem, setItem, removeItem, clear) whatever the Node runtime.
 * @param host - Host object on which to define `localStorage` (e.g. `window` in the jsdom environment)
 * @returns True if the polyfill was installed, false if a usable storage already exists or the definition failed
 */
export function installLocalStoragePolyfillIfNeeded(host: object): boolean {
    try {
        const current = (host as StorageHost).localStorage;

        if (isUsableStorage(current)) {
            return false;
        }

        Object.defineProperty(host, 'localStorage', {
            configurable: true,
            writable: true,
            value: createMemoryStorage(),
        });

        return true;
    } catch {
        return false;
    }
}
