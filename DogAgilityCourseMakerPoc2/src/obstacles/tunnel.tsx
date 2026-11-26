import React, { useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
import { createStraightChain, dragChainEnd } from '../services/tunnelChain';
import type { KonvaDragEvent, TunnelEnd, TunnelProps } from '../types/obstacleTypes';

/** Fill color of a pinned end anchor: the pin state must be unmistakable. */
const PINNED_ANCHOR_COLOR = '#EF4444';

/**
 * Tunnel (US-020): flexible tube shown in top view as a chain of pre-ratio
 * segments (~50 cm each, regulated 60 cm inner diameter + wall) hinged
 * together, bent by at most +/- 20 deg between two consecutive segments.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The joint
 * chain lives in local centimeters centered on (0, 0); when the obstacle
 * carries no `points` (legacy/straight data), a straight vertical chain is
 * derived from the regulated `length`.
 *
 * Interaction: the tunnel is deliberately NOT draggable as a whole and never
 * shows the transformer rotate handle (the TransformerComponent skips tunnel
 * types). Only the two extreme anchors can be grabbed: dragging one pulls the
 * whole tube like a string (rope physics, +/- 20 deg clamp between segments)
 * while the other end follows. A right-click on an anchor pins that end (the
 * circle turns red) until the tunnel is deselected or the anchor is
 * right-clicked again. Selecting the tunnel reveals the anchors, deselecting
 * hides them and clears any pin. A length number (bare, unit-free) is
 * displayed at the middle of the tube.
 */
export const Tunnel: React.FC<TunnelProps> = ({
    id,
    ratio,
    x,
    y,
    rotation,
    length,
    diameter,
    segmentLength,
    points,
    isSelected,
    primaryColor,
    secondaryColor,
    onClick,
    onTap,
    onPointsChange,
}) => {
    const joints = points ?? createStraightChain(length);

    // Pin state is ephemeral: it lives at most as long as the selection.
    const [pinnedEnd, setPinnedEnd] = useState<TunnelEnd | null>(null);

    // Dropping the selection clears the pin. Render-phase reset guarded by
    // the previous value: the React-recommended alternative to an effect.
    const [prevIsSelected, setPrevIsSelected] = useState(isSelected);

    if (prevIsSelected !== isSelected) {
        setPrevIsSelected(isSelected);

        if (!isSelected) setPinnedEnd(null);
    }

    const handleAnchorDragMove = (end: TunnelEnd) => (e: KonvaDragEvent): void => {
        if (pinnedEnd === end || !onPointsChange) return;

        // The dragged anchor reports its position in local px; the chain
        // works in local cm (pre-ratio).
        const target = { x: e.target.x() * ratio, y: e.target.y() * ratio };

        onPointsChange(id, dragChainEnd(joints, end, target, {
            pinnedStart: pinnedEnd === 'start',
            pinnedEnd: pinnedEnd === 'end',
        }));
    };

    // Right-click toggles the pin on that end; the circle color reflects it.
    const handleAnchorContextMenu = (end: TunnelEnd) => (): void => {
        setPinnedEnd((current) => (current === end ? null : end));
    };

    const first = joints[0];
    const last = joints[joints.length - 1];
    const middle = joints[Math.floor(joints.length / 2)];

    return (
        <Group
            type="tunnel"
            id={id}
            x={x}
            y={y}
            rotation={rotation}
            onClick={onClick}
            onTap={onTap}
        >
            {/* chain segments: one rect per 50 cm slab, rotated on its midpoint */}
            {joints.slice(0, -1).map((joint, i) => {
                const next = joints[i + 1];
                const midX = (joint.x + next.x) / 2;
                const midY = (joint.y + next.y) / 2;
                // Rects stand vertical by default: angle from the segment
                // direction so its height axis follows the segment.
                const angle = (Math.atan2(-(next.x - joint.x), next.y - joint.y) * 180) / Math.PI;

                return (
                    <Rect
                        key={i}
                        x={midX / ratio}
                        y={midY / ratio}
                        offsetX={diameter / 2 / ratio}
                        offsetY={segmentLength / 2 / ratio}
                        width={diameter / ratio}
                        height={segmentLength / ratio}
                        rotation={angle}
                        fill={primaryColor}
                    />
                );
            })}

            {/* bare length number (no unit), readable in the primary color */}
            <Text
                x={middle.x / ratio}
                y={middle.y / ratio}
                text={String(length / 100)}
                fontSize={24}
                fill={primaryColor}
                listening={false}
            />

            {/* extreme anchors: only visible while the tunnel is selected */}
            {isSelected && (
                <>
                    <Circle
                        x={first.x / ratio}
                        y={first.y / ratio}
                        radius={5}
                        fill={pinnedEnd === 'start' ? PINNED_ANCHOR_COLOR : secondaryColor}
                        draggable={true}
                        onDragMove={handleAnchorDragMove('start')}
                        onContextMenu={handleAnchorContextMenu('start')}
                    />
                    <Circle
                        x={last.x / ratio}
                        y={last.y / ratio}
                        radius={5}
                        fill={pinnedEnd === 'end' ? PINNED_ANCHOR_COLOR : secondaryColor}
                        draggable={true}
                        onDragMove={handleAnchorDragMove('end')}
                        onContextMenu={handleAnchorContextMenu('end')}
                    />
                </>
            )}
        </Group>
    );
};
