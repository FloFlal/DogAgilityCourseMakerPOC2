import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

// Generic type of the middleware (Zustand middleware pattern)
type LoggerMiddleware = <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
    config: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

/**
 * Store mutation logging middleware, development only
 * (import.meta.env.DEV). Logs the previous state then the next state on every `set`.
 * @param config - the state creator to wrap
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
