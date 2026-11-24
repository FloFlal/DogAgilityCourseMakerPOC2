import React from 'react';

type ObstacleIconProps = React.SVGProps<SVGSVGElement>;

/**
 * Schematic obstacle icons (US-031): hand-made monochrome SVGs in
 * `currentColor`, visible on the light canvas background (#83) as well as on
 * dark sidebar. Decorative (aria-hidden by default): the text label
 * of the button remains the accessible reference. One component per obstacle type,
 * to be extended with upcoming US (#61-#66).
 */

const ICON_PATHS = {
    width: 16,
    height: 16,
    // Decorative: hidden from screen readers, the text label is enough
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

/** Hurdle (jump): two uprights, elastic bar and ground bases. */
export const JumpIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-jump" {...ICON_PATHS} {...props}>
        <line x1="4" y1="4" x2="4" y2="16" />
        <line x1="16" y1="4" x2="16" y2="16" />
        <line x1="3" y1="16" x2="5" y2="16" />
        <line x1="15" y1="16" x2="17" y2="16" />
        <path d="M2.5 9.5 L6 8.5 L10 9.5 L14 8.5 L17.5 9.5" />
    </svg>
);

/** Seesaw: pivoting plank on its triangular support. */
export const SeesawIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-seesaw" {...ICON_PATHS} {...props}>
        <line x1="3" y1="10" x2="17" y2="10" />
        <path d="M6 15 L10 10 L14 15 Z" />
        <line x1="3" y1="15" x2="17" y2="15" />
    </svg>
);

/** Passerelle (dogWalk) : rampe, plateau central, rampe. */
export const DogWalkIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-dogWalk" {...ICON_PATHS} {...props}>
        <path d="M2 16 L6.5 7 L13.5 7 L18 16" />
        <line x1="4" y1="12" x2="16" y2="12" />
    </svg>
);

/** A-Frame: two triangle ramps with a dashed contact zone. */
export const AFrameIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-aFrame" {...ICON_PATHS} {...props}>
        <path d="M10 3 L3 17 L17 17 Z" />
        <line x1="6.15" y1="10" x2="13.85" y2="10" strokeDasharray="2 1.5" />
    </svg>
);

/** Oxer (double): two parallel planes, back plane higher. */
export const OxerIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-oxer" {...ICON_PATHS} {...props}>
        <line x1="8" y1="5" x2="8" y2="15" />
        <line x1="13" y1="2.5" x2="13" y2="17.5" />
    </svg>
);

/** Weave poles (weavePols): straight row of 12 poles. */
export const WeavePolsIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-weavePols" {...ICON_PATHS} {...props}>
        {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx="10" cy={2 + i * (16 / 11)} r="1.1" fill="currentColor" stroke="none" />
        ))}
    </svg>
);
