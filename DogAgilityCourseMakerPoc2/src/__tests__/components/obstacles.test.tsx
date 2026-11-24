import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Jump } from '../../obstacles/jump';
import { Seesaw } from '../../obstacles/seesaw';
import { DogWalk } from '../../obstacles/dogWalk';
import { AFrame } from '../../obstacles/aFrame';
import { WeavePols } from '../../obstacles/weavePols';
import type { BaseObstacleProps } from '../../types/obstacleTypes';

vi.mock('react-konva', async () => await import('./../mocks/reactKonva'));

const makeProps = (): BaseObstacleProps => ({
    id: 'obstacle-1',
    ratio: 2.5,
    x: 100,
    y: 200,
    rotation: 0,
    isSelected: false,
    primaryColor: '#1155FF',
    secondaryColor: '#FFFF00',
    onClick: vi.fn(),
    onTap: vi.fn(),
    onDragEnd: vi.fn(),
    onTransformEnd: vi.fn(),
    onDrag: vi.fn(),
});

interface ObstacleCase {
    name: string;
    renderWith: (props: BaseObstacleProps) => ReactElement;
    // Konva testids actually rendered by the obstacle (via the react-konva mock)
    primitives: string[];
}

const cases: ObstacleCase[] = [
    {
        name: 'Jump',
        renderWith: (props) => (
            <Jump
                {...props}
                barWidth={130}
                barThickness={5}
                hurdleWidth={50}
                hurdleDepth={40}
                hurdleThickness={10}
            />
        ),
        primitives: ['konva-rect', 'konva-circle', 'konva-line'],
    },
    {
        name: 'Seesaw',
        renderWith: (props) => <Seesaw {...props} width={30} length={370} zoneLength={90} />,
        primitives: ['konva-rect', 'konva-arrow'],
    },
    {
        name: 'DogWalk',
        renderWith: (props) => <DogWalk {...props} width={30} elementLength={370} zoneLength={90} />,
        primitives: ['konva-rect', 'konva-line'],
    },
    {
        name: 'AFrame',
        renderWith: (props) => <AFrame {...props} width={90} elementLength={270} zoneLength={106} />,
        primitives: ['konva-rect', 'konva-line'],
    },
    {
        name: 'WeavePols',
        renderWith: (props) => <WeavePols {...props} poleCount={12} poleSpacing={60} poleDiameter={4} />,
        primitives: ['konva-rect', 'konva-circle', 'konva-line'],
    },
];

describe("Composants d'obstacles", () => {
    it.each(cases)('$name se rend avec son identifiant et sa position', ({ renderWith }) => {
        const props = makeProps();
        const { getByTestId } = render(renderWith(props));
        const group = getByTestId('konva-group');

        expect(group.getAttribute('data-id')).toBe('obstacle-1');
        expect(group.getAttribute('data-x')).toBe('100');
        expect(group.getAttribute('data-y')).toBe('200');
    });

    it.each(cases)('$name rend des primitives Konva', ({ renderWith, primitives }) => {
        const { baseElement } = render(renderWith(makeProps()));

        for (const testId of primitives) {
            expect(baseElement.querySelectorAll(`[data-testid="${testId}"]`).length).toBeGreaterThan(0);
        }
    });

    it.each(cases)('$name propage le clic vers le handler onClick', ({ renderWith }) => {
        const props = makeProps();
        const { getByTestId } = render(renderWith(props));

        fireEvent.click(getByTestId('konva-group'));

        expect(props.onClick).toHaveBeenCalledTimes(1);
    });
});
