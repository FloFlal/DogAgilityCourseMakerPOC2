import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { CanvasArea } from '../../components/canvasArea';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

vi.mock('react-konva', async () => {
    const shared = await import('../mocks/reactKonva');
    const React = await import('react');

    // Scène fictive avec un pointeur positionné par les tests
    let pointer: { x: number; y: number } | null = { x: 40, y: 60 };
    const fakeStage = {
        getPointerPosition: (): { x: number; y: number } | null => pointer,
        findOne: (): undefined => undefined,
    };

    let clickHandler: ((e: unknown) => void) | undefined;

    const Stage = (props: Record<string, unknown>): ReactElement => {
        clickHandler = props.onClick as ((e: unknown) => void) | undefined;
        const ref = props.ref as { current: unknown } | undefined;

        React.useEffect(() => {
            if (ref) ref.current = fakeStage;
        });

        return React.createElement('div', { 'data-testid': 'konva-stage', children: props.children });
    };

    return {
        ...shared,
        Stage,
        __mock: {
            setPointer: (value: { x: number; y: number } | null): void => {
                pointer = value;
            },
            getClick: (): ((e: unknown) => void) | undefined => clickHandler,
        },
    };
});

interface StageKonvaMock {
    setPointer: (value: { x: number; y: number } | null) => void;
    getClick: () => ((e: unknown) => void) | undefined;
}

const makeObstacle = (id: string): Obstacle => ({
    id,
    type: 'jump',
    x: 10,
    y: 10,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

// Scène Konva fictive : getStage() renvoie la scène elle-même
const makeStageLike = (): { getStage: () => unknown } => {
    const stageLike: { getStage: () => unknown } = {
        getStage: () => undefined,
    };
    stageLike.getStage = () => stageLike;

    return stageLike;
};

// Évènement dont la cible EST la scène (clic sur le fond)
const backgroundClick = (): unknown => ({ target: makeStageLike() });

// Évènement dont la cible est un élément de la scène (clic sur un obstacle)
const obstacleClick = (): unknown => ({ target: { getStage: makeStageLike } });

let konvaMock: StageKonvaMock;

beforeAll(async () => {
    konvaMock = ((await import('react-konva')) as unknown as { __mock: StageKonvaMock }).__mock;
});

describe('CanvasArea - clic sur la scène', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [], selectedId: null, currentShapeType: 'jump' });
    });

    it('ajoute un obstacle au clic sur le fond quand rien n\'est sélectionné', () => {
        render(<CanvasArea />);
        const click = konvaMock.getClick();
        expect(click).toBeDefined();

        act(() => {
            click?.(backgroundClick());
        });

        const state = useDrawingStore.getState();
        expect(state.obstacles).toHaveLength(1);
        expect(state.obstacles[0].x).toBe(40);
        expect(state.obstacles[0].y).toBe(60);
        expect(state.selectedId).toBe(state.obstacles[0].id);
    });

    it("pose l'outil courant au clic sur le fond même si un obstacle est sélectionné", () => {
        const obstacle = makeObstacle('obstacle-1');
        useDrawingStore.setState({ obstacles: [obstacle], selectedId: 'obstacle-1', currentShapeType: 'jump' });

        render(<CanvasArea />);
        const click = konvaMock.getClick();

        act(() => {
            click?.(backgroundClick());
        });

        const state = useDrawingStore.getState();
        expect(state.obstacles).toHaveLength(2);
        expect(state.selectedId).toBe(state.obstacles[1].id);
    });

    it("ne pose rien au clic sur le fond sans outil actif", () => {
        const obstacle = makeObstacle('obstacle-1');
        useDrawingStore.setState({ obstacles: [obstacle], selectedId: 'obstacle-1', currentShapeType: null });

        render(<CanvasArea />);
        const click = konvaMock.getClick();

        act(() => {
            click?.(backgroundClick());
        });

        const state = useDrawingStore.getState();
        expect(state.obstacles).toHaveLength(1);
        expect(state.selectedId).toBe('obstacle-1');
    });

    it('ignore le clic cible un obstacle de la scène', () => {
        render(<CanvasArea />);
        const click = konvaMock.getClick();

        act(() => {
            click?.(obstacleClick());
        });

        expect(useDrawingStore.getState().obstacles).toHaveLength(0);
    });

    it('n\'ajoute rien si le pointeur Konva est inconnu', () => {
        konvaMock.setPointer(null);

        render(<CanvasArea />);
        const click = konvaMock.getClick();

        act(() => {
            click?.(backgroundClick());
        });

        expect(useDrawingStore.getState().obstacles).toHaveLength(0);
    });
});
