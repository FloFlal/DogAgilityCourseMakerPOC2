import React from 'react';

// Common react-konva mock for jsdom tests:
// each Konva primitive is replaced by a div carrying its useful props.
type AnyProps = Record<string, unknown>;

// Wraps a Konva mouse handler into a DOM handler: the event object
// mimics the Konva API used by the components (cancelBubble, target.getStage()).
function wrapMouseHandler(handler: unknown): ((event: Event) => void) | undefined {
    if (typeof handler !== 'function') return undefined;

    return (nativeEvent: Event): void => {
        (handler as (e: unknown) => void)({
            target: {
                getStage: (): null => null,
                x: (): number => 0,
                y: (): number => 0,
                rotation: (): number => 0,
            },
            cancelBubble: false,
            nativeEvent,
        });
    };
}

function renderNode(testId: string, props: AnyProps): React.ReactElement {
    const click = wrapMouseHandler(props.onClick) ?? wrapMouseHandler(props.onTap);
    const contextMenu = wrapMouseHandler(props.onContextMenu);
    // Konva has no DOM dragmove event: the mock exposes the wrapped
    // onDragMove through React's onDrag so tests can fire `fireEvent.drag`.
    const dragMove = wrapDragMoveHandler(props.onDragMove);

    return React.createElement('div', {
        'data-testid': testId,
        'data-id': props.id as string | undefined,
        'data-points': props.points ? JSON.stringify(props.points) : undefined,
        'data-x': props.x as number | undefined,
        'data-y': props.y as number | undefined,
        'data-fill': props.fill as string | undefined,
        'data-text': props.text as string | undefined,
        ...(click ? { onClick: click } : {}),
        ...(contextMenu ? { onContextMenu: contextMenu } : {}),
        ...(dragMove ? { onDrag: dragMove } : {}),
        children: props.children,
    });
}

// Wraps a Konva drag-move handler: the event object carries a target whose
// x()/y() return the fixed local position used by the tests.
function wrapDragMoveHandler(handler: unknown): ((event: Event) => void) | undefined {
    if (typeof handler !== 'function') return undefined;

    return (nativeEvent: Event): void => {
        (handler as (e: unknown) => void)({
            target: {
                x: (): number => 7,
                y: (): number => 14,
            },
            cancelBubble: false,
            nativeEvent,
        });
    };
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

export function Text(props: AnyProps): React.ReactElement {
    return renderNode('konva-text', props);
}

// The Transformer ref is intentionally not forwarded: the ref stays null
// and the component effect stops cleanly in the test environment.
export function Transformer(): React.ReactElement {
    return React.createElement('div', { 'data-testid': 'konva-transformer' });
}
