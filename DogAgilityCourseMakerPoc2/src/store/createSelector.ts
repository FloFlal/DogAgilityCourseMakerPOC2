// Sélecteur de base : fonction pure extrayant une donnée de l'état
export type Selector<TState, TResult> = (state: TState) => TResult;

// Combiner : fonction recevant les valeurs des sélecteurs d'entrée
type Combiner = (...values: never[]) => unknown;

/**
 * Utilitaire de création de sélecteurs memoized (même sémantique que
 * createSelector de Reselect, adapté à Zustand).
 *
 * Le combiner (dernier argument) n'est rappelé que si au moins une entrée
 * change (comparaison par référence, donc par valeur pour les primitifs).
 *
 * @example
 * const selectSelectedObstacle = createSelector(
 *     selectObstacles,
 *     selectSelectedId,
 *     (obstacles, selectedId) => obstacles.find((o) => o.id === selectedId),
 * );
 *
 * @returns un sélecteur memoized utilisable avec useDrawingStore(selector)
 */
// Surcharge : 1 entrée
export function createSelector<TState, T1, TResult>(
    s1: Selector<TState, T1>,
    combiner: (a: T1) => TResult,
): Selector<TState, TResult>;
// Surcharge : 2 entrées
export function createSelector<TState, T1, T2, TResult>(
    s1: Selector<TState, T1>,
    s2: Selector<TState, T2>,
    combiner: (a: T1, b: T2) => TResult,
): Selector<TState, TResult>;
// Surcharge : 3 entrées
export function createSelector<TState, T1, T2, T3, TResult>(
    s1: Selector<TState, T1>,
    s2: Selector<TState, T2>,
    s3: Selector<TState, T3>,
    combiner: (a: T1, b: T2, c: T3) => TResult,
): Selector<TState, TResult>;

// Implémentation runtime (détails de typage arbitrés par les surcharges)
export function createSelector(...args: unknown[]): Selector<unknown, unknown> {
    const combiner = args[args.length - 1] as Combiner;
    const inputSelectors = args.slice(0, -1) as ((state: unknown) => unknown)[];

    let lastInputs: unknown[] | null = null;
    let lastResult: unknown = null;

    return (state: unknown): unknown => {
        const nextInputs = inputSelectors.map((selector) => selector(state));

        if (lastInputs !== null && areInputsEqual(lastInputs, nextInputs)) {
            return lastResult;
        }

        lastResult = (combiner as (...values: unknown[]) => unknown)(...nextInputs);
        lastInputs = nextInputs;

        return lastResult;
    };
}

function areInputsEqual(previous: unknown[], next: unknown[]): boolean {
    for (let i = 0; i < previous.length; i++) {
        if (!Object.is(previous[i], next[i])) {
            return false;
        }
    }

    return true;
}
