import React, { useEffect, useRef, useState } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import { createStraightChain, dragChainEnd } from '../services/tunnelChain';
import type { KonvaDragEvent, TunnelEnd, TunnelPoint, TunnelProps } from '../types/obstacleTypes';

/** Fill color of a pinned end anchor: the pin state must be unmistakable. */
const PINNED_ANCHOR_COLOR = '#EF4444';

/** Extra length (cm) of a hinge connector on both sides, so it disappears under the segments. */
const CONNECTOR_OVERLAP_CM = 4;

/**
 * Tunnel (US-020): flexible tube shown in top view as a chain of pre-ratio
 * segments (~50 cm each, regulated 60 cm inner diameter + wall) hinged
 * together, bent by at most +/- 25 deg between two consecutive segments.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The joint
 * chain lives in local centimeters centered on (0, 0); when the obstacle
 * carries no `points` (legacy/straight data), a straight vertical chain is
 * derived from the regulated `length`.
 *
 * Interaction: the tunnel is deliberately NOT draggable as a whole and never
 * shows the transformer rotate handle (the TransformerComponent skips tunnel
 * types). Only the two extreme anchors can be grabbed. Dragging a FREE end
 * moves the whole tunnel as a rigid body: pure 1:1 translation with the
 * cursor, no lag and no bending. Dragging the free end while the OTHER end
 * is pinned (right-click) curves the tube like a rope around the pin with a
 * +/- 25 deg clamp between segments: saturated joints hold their remembered
 * bend side (hysteresis), so over-curving resists smoothly and elements
 * slip sideways instead of swinging wildly. A right-click on an anchor pins
 * that end (the circle turns red) until the tunnel is deselected or the
 * anchor is right-clicked again. Selecting the tunnel reveals the anchors,
 * deselecting hides them and clears any pin. A length number (bare,
 * unit-free) is displayed at the middle of the tube.
 *
 * Rendering detail: hinge connectors (one rect joining the centers of two
 * consecutive segments, drawn under them) fill the wedge gaps that appear on
 * the outer side of a bend.
 *
 * `pointerTargetCm` is essential: in pinned mode the drag target must be the
 * real cursor position, not the tip position clamped by `dragBoundFunc`.
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

    // Latest chain for the dragBoundFunc closure (keeps the dragged anchor
    // glued to the chain tip, including when the pinned rope solve leaves
    // the tip short of the cursor).
    const jointsRef = useRef<TunnelPoint[]>(joints);

    useEffect(() => {
        jointsRef.current = joints;
    }, [joints]);

    // Pin state is ephemeral: it lives at most as long as the selection.
    const [pinnedEnd, setPinnedEnd] = useState<TunnelEnd | null>(null);

    // Dropping the selection clears the pin. Render-phase reset guarded by
    // the previous value: the React-recommended alternative to an effect.
    const [prevIsSelected, setPrevIsSelected] = useState(isSelected);

    if (prevIsSelected !== isSelected) {
        setPrevIsSelected(isSelected);

        if (!isSelected) setPinnedEnd(null);
    }

    const applyAnchorDrag = (end: TunnelEnd, target: TunnelPoint): void => {
        if (pinnedEnd === end || !onPointsChange) return;

        onPointsChange(id, dragChainEnd(joints, end, target, {
            pinnedStart: pinnedEnd === 'start',
            pinnedEnd: pinnedEnd === 'end',
        }));
    };

    const pointerTargetCm = (e: KonvaDragEvent): TunnelPoint | null => {
        // Real Konva: live pointer in absolute stage coords. The stage and
        // the obstacles layer sit untransformed at the origin and the tunnel
        // group never rotates, so local px = absolute px - group position.
        const pointer = e.target.getStage?.()?.getPointerPosition();

        if (!pointer) return null;

        return { x: (pointer.x - x) * ratio, y: (pointer.y - y) * ratio };
    };

    const handleAnchorDragMove = (end: TunnelEnd) => (e: KonvaDragEvent): void => {
        // In the test mock (no stage) the dragged node position stands in for
        // the pointer.
        const target = pointerTargetCm(e) ?? { x: e.target.x() * ratio, y: e.target.y() * ratio };

        applyAnchorDrag(end, target);
    };

    // Keeps the visual anchor on the chain tip, even when the pinned rope
    // solve lets the tip land short of the cursor (or when the end is
    // pinned). The
    // default dragged position is deliberately ignored: the anchor is always
    // snapped onto the chain tip.
    const anchorBoundFunc = (end: TunnelEnd) => (pos: Konva.Vector2d): Konva.Vector2d => {
        void pos;
        const current = jointsRef.current;
        const tip = end === 'start' ? current[0] : current[current.length - 1];

        return { x: x + tip.x / ratio, y: y + tip.y / ratio };
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
            {/* hinge connectors joining the centers of consecutive segments,
                drawn under the segments to fill the outer bend gaps */}
            {joints.slice(0, -2).map((joint, i) => {
                const centerA = { x: (joint.x + joints[i + 1].x) / 2, y: (joint.y + joints[i + 1].y) / 2 };
                const centerB = { x: (joints[i + 1].x + joints[i + 2].x) / 2, y: (joints[i + 1].y + joints[i + 2].y) / 2 };
                const vx = centerB.x - centerA.x;
                const vy = centerB.y - centerA.y;
                const length = Math.hypot(vx, vy);

                if (length < 1e-6) return null;

                return (
                    <Rect
                        key={`connector-${i}`}
                        x={((centerA.x + centerB.x) / 2) / ratio}
                        y={((centerA.y + centerB.y) / 2) / ratio}
                        offsetX={diameter / 2 / ratio}
                        offsetY={(length + 2 * CONNECTOR_OVERLAP_CM) / 2 / ratio}
                        width={diameter / ratio}
                        height={(length + 2 * CONNECTOR_OVERLAP_CM) / ratio}
                        rotation={(Math.atan2(-vx, vy) * 180) / Math.PI}
                        fill={primaryColor}
                    />
                );
            })}

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
                        dragBoundFunc={anchorBoundFunc('start')}
                        onDragMove={handleAnchorDragMove('start')}
                        onContextMenu={handleAnchorContextMenu('start')}
                    />
                    <Circle
                        x={last.x / ratio}
                        y={last.y / ratio}
                        radius={5}
                        fill={pinnedEnd === 'end' ? PINNED_ANCHOR_COLOR : secondaryColor}
                        draggable={true}
                        dragBoundFunc={anchorBoundFunc('end')}
                        onDragMove={handleAnchorDragMove('end')}
                        onContextMenu={handleAnchorContextMenu('end')}
                    />
                </>
            )}
        </Group>
    );
};
