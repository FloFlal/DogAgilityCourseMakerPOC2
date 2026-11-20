import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { TransformerComponent } from '../../components/canvas/transformerComponent';
import { MIN_OBSTACLE_SIZE } from '../../constants/canvasDefaults';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Box } from 'konva/lib/shapes/Transformer';

vi.mock('react-konva', async () => {
    const React = await import('react');
    const { createElement, useEffect } = React;

    // Instance fictive de Transformer avec l'API utilisée par le composant
    const transformerInstance: {
        nodes: ReturnType<typeof vi.fn>;
        getStage: ReturnType<typeof vi.fn>;
        getLayer: () => { batchDraw: () => void };
    } = {
        nodes: vi.fn(),
        getStage: vi.fn(),
        getLayer: () => ({ batchDraw: vi.fn() }),
    };
    const fakeStage = { findOne: vi.fn(() => undefined) };
    transformerInstance.getStage.mockReturnValue(fakeStage);

    type TransformerMockProps = {
        ref?: { current: unknown } | undefined;
        [key: string]: unknown;
    };

    let lastProps: TransformerMockProps = {};

    const Transformer = (props: TransformerMockProps): ReactElement => {
        lastProps = props;

        // Instance fictive assignée à la ref, avant l'effet du composant testé
        useEffect(() => {
            if (props.ref) props.ref.current = transformerInstance;
            return () => {
                if (props.ref) props.ref.current = null;
            };
        });

        return createElement('div', { 'data-testid': 'konva-transformer' });
    };

    const Layer = (props: { children?: unknown }): ReactElement =>
        createElement('div', { 'data-testid': 'konva-layer', children: props.children });

    return {
        Layer,
        Transformer,
        __mock: { transformerInstance, fakeStage, getProps: () => lastProps },
    };
});

interface TransformerKonvaMock {
    transformerInstance: {
        nodes: ReturnType<typeof vi.fn>;
        getStage: ReturnType<typeof vi.fn>;
        getLayer: () => { batchDraw: () => void };
    };
    fakeStage: { findOne: ReturnType<typeof vi.fn> };
    getProps: () => Record<string, unknown>;
}

let konvaMock: TransformerKonvaMock;

beforeAll(async () => {
    konvaMock = ((await import('react-konva')) as unknown as { __mock: TransformerKonvaMock }).__mock;
});

describe('TransformerComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        konvaMock.transformerInstance.getStage.mockReturnValue(konvaMock.fakeStage);
        konvaMock.fakeStage.findOne.mockReturnValue(undefined);
        useDrawingStore.setState({ obstacles: [], selectedId: null });
    });

    it('vide le transformer quand aucun obstacle n\'est sélectionné', () => {
        render(<TransformerComponent selectedId={null} />);

        expect(konvaMock.transformerInstance.nodes).toHaveBeenCalledWith([]);
        expect(konvaMock.transformerInstance.getLayer().batchDraw).toBeDefined();
    });

    it('attache le nœud Konva de l\'obstacle sélectionné', () => {
        const selectedNode = { id: 'obstacle-1' };
        konvaMock.fakeStage.findOne.mockReturnValue(selectedNode);

        render(<TransformerComponent selectedId="obstacle-1" />);

        expect(konvaMock.fakeStage.findOne).toHaveBeenCalledWith('#obstacle-1');
        expect(konvaMock.transformerInstance.nodes).toHaveBeenLastCalledWith([selectedNode]);
    });

    it('vide le transformer quand le nœud sélectionné est introuvable', () => {
        render(<TransformerComponent selectedId="inconnu" />);

        expect(konvaMock.fakeStage.findOne).toHaveBeenCalledWith('#inconnu');
        expect(konvaMock.transformerInstance.nodes).toHaveBeenLastCalledWith([]);
    });

    it('gère l\'absence de scène Konva', () => {
        konvaMock.transformerInstance.getStage.mockReturnValue(null);

        render(<TransformerComponent selectedId="obstacle-1" />);

        expect(konvaMock.transformerInstance.nodes).not.toHaveBeenCalled();
    });

    it('refuse les transformations sous la taille minimale', () => {
        render(<TransformerComponent selectedId={null} />);

        const props = konvaMock.getProps() as {
            boundBoxFunc: (oldBox: Box, newBox: Box) => Box;
        };
        expect(typeof props.boundBoxFunc).toBe('function');

        const oldBox = { width: 40, height: 40 } as unknown as Box;

        const tooNarrow = { width: MIN_OBSTACLE_SIZE - 1, height: 40 } as unknown as Box;
        const tooShort = { width: 40, height: MIN_OBSTACLE_SIZE - 1 } as unknown as Box;
        const valid = { width: 50, height: 50 } as unknown as Box;

        expect(props.boundBoxFunc(oldBox, tooNarrow)).toBe(oldBox);
        expect(props.boundBoxFunc(oldBox, tooShort)).toBe(oldBox);
        expect(props.boundBoxFunc(oldBox, valid)).toBe(valid);
    });
});
