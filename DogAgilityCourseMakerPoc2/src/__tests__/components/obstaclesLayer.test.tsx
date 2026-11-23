import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ObstaclesLayer } from '../../components/canvas/obstaclesLayer';
import { TransformerComponent } from '../../components/canvas/transformerComponent';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

vi.mock('react-konva', async () => await import('./../mocks/reactKonva'));

const makeObstacle = (id: string, type: Obstacle['type']): Obstacle => ({
    id,
    type,
    x: 0,
    y: 0,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

const noop = (): void => undefined;

describe('ObstaclesLayer', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [], selectedId: null });
    });

    it('rend chaque type d\'obstacle avec son identifiant', () => {
        useDrawingStore.setState({
            obstacles: [
                makeObstacle('jump-1', 'jump'),
                makeObstacle('seesaw-1', 'seesaw'),
                makeObstacle('walk-1', 'dogWalk'),
                makeObstacle('aframe-1', 'aFrame'),
                makeObstacle('weave-1', 'weavePols'),
            ],
        });

        const shapes = useDrawingStore.getState().obstacles;

        render(
            <ObstaclesLayer
                shapes={shapes}
                selectedId={null}
                onSelect={noop}
                onDragStart={noop}
                onDragEnd={noop}
                onTransformEnd={noop}
            />
        );

        const groups = screen.getAllByTestId('konva-group');

        expect(groups.map((g) => g.getAttribute('data-id'))).toEqual([
            'jump-1',
            'seesaw-1',
            'walk-1',
            'aframe-1',
            'weave-1',
        ]);
    });

    it('ignore les types d\'obstacles non supportés', () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('tire-1', 'tire')] });

        const shapes = useDrawingStore.getState().obstacles;

        render(
            <ObstaclesLayer
                shapes={shapes}
                selectedId={null}
                onSelect={noop}
                onDragStart={noop}
                onDragEnd={noop}
                onTransformEnd={noop}
            />
        );

        expect(screen.queryAllByTestId('konva-group')).toHaveLength(0);
    });
});

describe('TransformerComponent', () => {
    it('rend le transformer sans obstacle sélectionné', () => {
        render(<TransformerComponent selectedId={null} />);

        expect(screen.getByTestId('konva-transformer')).toBeTruthy();
    });
});
