import React from 'react';

// Mock commun de react-konva pour les tests en jsdom :
// chaque primitive Konva est remplacée par une div portant ses props utiles.
type AnyProps = Record<string, unknown>;

function renderNode(testId: string, props: AnyProps): React.ReactElement {
    return React.createElement('div', {
        'data-testid': testId,
        'data-id': props.id as string | undefined,
        'data-points': props.points ? JSON.stringify(props.points) : undefined,
        'data-x': props.x as number | undefined,
        'data-y': props.y as number | undefined,
        children: props.children,
    });
}

export function Stage(props: AnyProps): React.ReactElement {
    return React.createElement('div', {
        'data-testid': 'konva-stage',
        ref: props.ref as never,
        children: props.children,
    });
}

export function Layer(props: AnyProps): React.ReactElement {
    return React.createElement('div', { 'data-testid': 'konva-layer', children: props.children });
}

export function Line(props: AnyProps): React.ReactElement {
    return renderNode('konva-line', props);
}

export function Group(props: AnyProps): React.ReactElement {
    return renderNode('konva-group', props);
}

export function Rect(props: AnyProps): React.ReactElement {
    return renderNode('konva-rect', props);
}

export function Circle(props: AnyProps): React.ReactElement {
    return renderNode('konva-circle', props);
}

export function Arrow(props: AnyProps): React.ReactElement {
    return renderNode('konva-arrow', props);
}

// Le ref du Transformer n'est volontairement pas transmis : la ref reste null
// et l'effet du composant s'arrête proprement en environnement de test.
export function Transformer(): React.ReactElement {
    return React.createElement('div', { 'data-testid': 'konva-transformer' });
}
