import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { CanvasArea } from '../../components/canvasArea';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

vi.mock('react-konva', async () => {
    const shared = await import('../mocks/reactKonva');
    const React = await import('react');

    // Fake stage with a pointer positioned by the tests
    let pointer: { x: number; y: number } | null = { x: 40, y: 60 };
    const fakeStage = {
        getPointerPosition: (): { x: number; y: number } | null => pointer,
        // World coordinates (pan-aware, US-033 review)
        getRelativePointerPosition: (): { x: number; y: number } | null => pointer,
        findOne: (): undefined => undefined,
    };

    let clickHandler: ((e: unknown) => void) | undefined;
    let wheelHandler: ((e: unknown) => void) | undefined;
    let dragMoveHandler: ((e: unknown) => void) | undefined;
    let stageProps: Record<string, unknown> = {};

    const Stage = (props: Record<string, unknown>): ReactElement => {
        clickHandler = props.onClick as ((e: unknown) => void) | undefined;
        wheelHandler = props.onWheel as ((e: unknown) => void) | undefined;
        dragMoveHandler = props.onDragMove as ((e: unknown) => void) | undefined;
        stageProps = props;
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
            getWheel: (): ((e: unknown) => void) | undefined => wheelHandler,
            getDragMove: (): ((e: unknown) => void) | undefined => dragMoveHandler,
            getStageProps: (): Record<string, unknown> => stageProps,
        },
    };
});

interface StageKonvaMock {
    setPointer: (value: { x: number; y: number } | null) => void;
    getClick: () => ((e: unknown) => void) | undefined;
    getWheel: () => ((e: unknown) => void) | undefined;
    getDragMove: () => ((e: unknown) => void) | undefined;
    getStageProps: () => Record<string, unknown>;
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

// Fake Konva Stage: getStage() returns the stage itself
const makeStageLike = (): { getStage: () => unknown } => {
    const stageLike: { getStage: () => unknown } = {
        getStage: () => undefined,
    };
    stageLike.getStage = () => stageLike;

    return stageLike;
};

// Event whose target IS the stage (background click)
const backgroundClick = (): unknown => ({ target: makeStageLike() });

// Event whose target is an element of the stage (obstacle click)
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
        expect(state.selectedId).toBeNull();
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
        expect(state.selectedId).toBe('obstacle-1');
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

describe('CanvasArea - panoramique de la vue (revision US-033)', () => {
    beforeEach(() => {
        window.innerWidth = 1024;
        window.innerHeight = 768;
        useDrawingStore.setState({
            obstacles: [],
            selectedId: null,
            currentShapeType: null,
            fieldWidthMeters: 20,
            fieldLengthMeters: 40,
        });
    });

    it('rend la scène draggable quand aucun outil n\'est armé', () => {
        render(<CanvasArea />);

        expect(konvaMock.getStageProps().draggable).toBe(true);
    });

    it('gèle le panoramique quand un outil est armé (le clic pose l\'obstacle)', () => {
        useDrawingStore.setState({ currentShapeType: 'jump' });

        render(<CanvasArea />);

        expect(konvaMock.getStageProps().draggable).toBe(false);
    });

    it('la molette déplace la vue en respectant les bornes du monde', () => {
        render(<CanvasArea />);

        const wheel = konvaMock.getWheel();

        act(() => {
            wheel?.({ evt: { deltaX: 500, deltaY: 0, preventDefault: (): void => {} } });
        });

        // Monde : 60 px x2 + 20 m x 40 = 920 px de large ; vue : 1024 - 320 = 704 px
        expect(konvaMock.getStageProps().x).toBe(-216);

        act(() => {
            wheel?.({ evt: { deltaX: 500, deltaY: 3000, preventDefault: (): void => {} } });
        });

        // Monde : 60 px x2 + 40 m x 40 = 1720 px de haut ; vue : 768 px
        expect(konvaMock.getStageProps().x).toBe(-216);
        expect(konvaMock.getStageProps().y).toBe(-952);
    });

    it('le glisser du fond déplace la vue avec bornes', () => {
        render(<CanvasArea />);

        const dragMove = konvaMock.getDragMove();

        act(() => {
            dragMove?.({ target: { position: (): { x: number; y: number } => ({ x: 50, y: -2000 }) } });
        });

        expect(konvaMock.getStageProps().x).toBe(0);
        expect(konvaMock.getStageProps().y).toBe(-952);
    });
});
