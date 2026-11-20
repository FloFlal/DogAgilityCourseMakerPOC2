/**
 * Storage en mémoire utilisé comme polyfill de substitution dans les tests.
 * Réplique la sémantique de l'interface Storage (couples clé/valeur chaînes de
 * caractères, `getItem` retournant `null` pour une clé absente).
 */
export type MemoryStorage = Pick<
    Storage,
    'getItem' | 'setItem' | 'removeItem' | 'clear'
>;

/**
 * Crée un storage en mémoire indépendant, cloisonné entre les installations.
 * @returns Un objet conforme à la sous-interface MemoryStorage (getUser : getItem, setItem, removeItem, clear)
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
 * Vérifie qu'une valeur expose bien le service Storage attendu.
 * @param value - Valeur à inspecter (peut être undefined ou un objet incomplet)
 * @returns Vrai si la valeur implémente les quatre méthodes de MemoryStorage
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
 * Installe un polyfill en mémoire si `localStorage` est indisponible sur l'hôte.
 * Nœud 26+ expose un global `localStorage` expérimental qui, sans l'option
 * `--localstorage-file`, masque le localStorage fourni par jsdom dans
 * l'environnement Vitest : ce polyfill garantit alors une sémantique réelle
 * (getItem, setItem, removeItem, clear) quel que soit le runtime Node.
 * @param host - Objet hôte sur lequel définir `localStorage` (ex. `window` en environnement jsdom)
 * @returns Vrai si le polyfill a été installé, faux si un storage utilisable existe déjà ou si la définition a échoué
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
