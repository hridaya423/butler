'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { cn } from './utils';

type FallingLeavesProps = {
  leafCount?: number;
  className?: string;
};

const COLOR_PALETTES = [
  { start: '#F97316', end: '#EA580C' },
  { start: '#FB923C', end: '#F97316' },
  { start: '#F59E0B', end: '#C2410C' },
  { start: '#FBBF24', end: '#EA580C' },
  { start: '#FDBA74', end: '#F97316' },
];

const LEAF_PATHS = [
  'M62 4C76 10 92 26 104 46C114 64 118 88 110 110C102 132 82 150 60 156C42 162 22 158 10 140C-2 122 0 92 12 66C24 40 44 16 62 4Z',
  'M58 6C74 14 90 32 100 54C110 76 112 102 98 126C86 148 60 164 38 160C18 156 4 134 4 108C4 82 18 52 34 32C42 22 50 12 58 6Z',
  'M64 2C80 12 96 30 108 54C118 74 120 100 108 124C96 148 72 162 48 160C30 158 16 144 10 124C2 98 12 70 26 48C38 30 52 14 64 2Z',
];

type LeafConfig = {
  id: number;
  left: number;
  delay: number;
  fallDuration: number;
  swayDuration: number;
  spinDuration: number;
  size: number;
  blur: number;
  opacity: number;
  gradient: { start: string; end: string };
  pathIndex: number;
  tilt: number;
  veinOpacity: number;
};

const createLeaves = (leafCount: number): LeafConfig[] => {
  return Array.from({ length: leafCount }, (_, index) => {
    const gradient = COLOR_PALETTES[index % COLOR_PALETTES.length];
    const pathIndex = Math.floor(Math.random() * LEAF_PATHS.length);
    const tilt = (Math.random() - 0.5) * 28;
    const veinOpacity = 0.25 + Math.random() * 0.35;
    return {
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      fallDuration: 12 + Math.random() * 8,
      swayDuration: 3.5 + Math.random() * 2.5,
      spinDuration: 8 + Math.random() * 8,
      size: 18 + Math.random() * 18,
      blur: Math.random() > 0.75 ? 3 + Math.random() * 4 : 0,
      opacity: 0.5 + Math.random() * 0.35,
      gradient,
      pathIndex,
      tilt,
      veinOpacity,
    };
  });
};

export function FallingLeaves({ leafCount = 18, className }: FallingLeavesProps) {
  const [leaves, setLeaves] = useState<LeafConfig[]>(() => createLeaves(leafCount));

  useEffect(() => {
    setLeaves(createLeaves(leafCount));
  }, [leafCount]);

  return (
    <div className={cn('falling-leaves pointer-events-none', className)} aria-hidden="true">
      {leaves.map((leaf) => {
        const leafStyle: CSSProperties = {
          left: `${leaf.left.toFixed(2)}%`,
          animationDelay: `-${leaf.delay.toFixed(2)}s`,
          '--fall-duration': `${leaf.fallDuration.toFixed(2)}s`,
        } as CSSProperties;

        const swayStyle: CSSProperties = {
          animationDelay: `-${leaf.delay.toFixed(2)}s`,
          '--sway-duration': `${leaf.swayDuration.toFixed(2)}s`,
        } as CSSProperties;

        const baseShadow = 'drop-shadow(0 16px 22px rgba(120, 54, 15, 0.16))';
        const filter = leaf.blur
          ? `${baseShadow} blur(${leaf.blur.toFixed(1)}px)`
          : baseShadow;

        const gradientId = `leaf-gradient-${leaf.id}`;
        const highlightId = `leaf-highlight-${leaf.id}`;
        const shadowId = `leaf-shadow-${leaf.id}`;

        const innerStyle: CSSProperties = {
          width: `${leaf.size.toFixed(2)}px`,
          height: `${(leaf.size * 1.6).toFixed(2)}px`,
          opacity: leaf.opacity,
          animationDelay: `-${leaf.delay.toFixed(2)}s`,
          '--spin-duration': `${leaf.spinDuration.toFixed(2)}s`,
          '--leaf-tilt': `${leaf.tilt.toFixed(2)}deg`,
          '--leaf-vein-opacity': `${leaf.veinOpacity.toFixed(2)}`,
          filter,
        } as CSSProperties;

        return (
          <span key={leaf.id} className="falling-leaf" style={leafStyle}>
            <span className="falling-leaf__sway" style={swayStyle}>
              <span className="falling-leaf__inner" style={innerStyle}>
                <svg className="falling-leaf__svg" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id={gradientId} x1="25%" y1="0%" x2="80%" y2="100%">
                      <stop offset="0%" stopColor={leaf.gradient.start} />
                      <stop offset="100%" stopColor={leaf.gradient.end} />
                    </linearGradient>
                    <radialGradient id={highlightId} cx="32%" cy="22%" r="60%">
                      <stop offset="0%" stopColor="rgba(255, 249, 235, 0.8)" />
                      <stop offset="55%" stopColor="rgba(255, 249, 235, 0.15)" />
                      <stop offset="100%" stopColor="rgba(255, 249, 235, 0)" />
                    </radialGradient>
                    <radialGradient id={shadowId} cx="70%" cy="78%" r="68%">
                      <stop offset="0%" stopColor="rgba(124, 45, 18, 0.35)" />
                      <stop offset="70%" stopColor="rgba(124, 45, 18, 0.05)" />
                      <stop offset="100%" stopColor="rgba(124, 45, 18, 0)" />
                    </radialGradient>
                  </defs>
                  <path d={LEAF_PATHS[leaf.pathIndex]} fill={`url(#${gradientId})`} />
                  <path d={LEAF_PATHS[leaf.pathIndex]} fill={`url(#${highlightId})`} opacity="0.65" />
                  <path d={LEAF_PATHS[leaf.pathIndex]} fill={`url(#${shadowId})`} opacity="0.8" />
                  <g className="falling-leaf__veins" strokeWidth={2.4} strokeLinecap="round">
                    <path d="M60 10 C56 32 52 70 60 148" />
                    <path d="M58 46 C46 56 36 72 30 92" />
                    <path d="M62 64 C72 72 84 84 92 106" />
                  </g>
                </svg>
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default FallingLeaves;
