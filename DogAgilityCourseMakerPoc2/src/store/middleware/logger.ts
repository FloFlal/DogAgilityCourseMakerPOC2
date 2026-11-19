import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

// Type générique du middleware (pattern middleware Zustand)
type LoggerMiddleware = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    config: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

/**
 * Middleware de logging des mutations du store, uniquement en développement
 * (import.meta.env.DEV). Log l'état précédent puis l'état suivant à chaque `set`.
 * @param config - le créateur d'état à envelopper
 */
export const logger: LoggerMiddleware = (config) => (set, get, api) => {
    const setWithLogging = ((partial: unknown) => {
        if (import.meta.env.DEV) {
            console.log('[zustand] previous state', get());
        }

        set(partial as never);

        if (import.meta.env.DEV) {
            console.log('[zustand] next state', get());
        }
    }) as typeof set;

    return config(setWithLogging, get, api);
};
