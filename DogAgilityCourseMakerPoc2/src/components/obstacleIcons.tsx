import React from 'react';

type ObstacleIconProps = React.SVGProps<SVGSVGElement>;

/**
 * Icônes schématiques des obstacles (US-031) : SVG maison monochromes en
 * `currentColor`, reconnaissables sur le fond clair du canvas (#83) comme sur
 * la sidebar sombre. Décoratives (aria-hidden par défaut) : le libellé texte
 * du bouton reste la référence accessible. Un composant par type d'obstacle,
 * à étendre avec les futures US (#61-#66).
 */

const ICON_PATHS = {
    width: 16,
    height: 16,
    // Décoratives : masquées aux lecteurs d'écran, le libellé suffit
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

/** Haie (jump) : deux montants, barre élastique et bases au sol. */
export const JumpIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-jump" {...ICON_PATHS} {...props}>
        <line x1="4" y1="4" x2="4" y2="16" />
        <line x1="16" y1="4" x2="16" y2="16" />
        <line x1="3" y1="16" x2="5" y2="16" />
        <line x1="15" y1="16" x2="17" y2="16" />
        <path d="M2.5 9.5 L6 8.5 L10 9.5 L14 8.5 L17.5 9.5" />
    </svg>
);

/** Bascule (seesaw) : plateau pivotant sur son support triangulaire. */
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

/** Palissade (A-Frame) : deux rampes en triangle avec zone de contact pointillée. */
export const AFrameIcon: React.FC<ObstacleIconProps> = (props) => (
    <svg viewBox="0 0 20 20" data-testid="obstacle-icon-aFrame" {...ICON_PATHS} {...props}>
        <path d="M10 3 L3 17 L17 17 Z" />
        <line x1="6.15" y1="10" x2="13.85" y2="10" strokeDasharray="2 1.5" />
    </svg>
);
