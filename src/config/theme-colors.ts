export interface ThemeColors {
  primary: string;
  secondary: string;

  glow: string;
  atmosphere: string;

  accent: string;
  shadow: string;

  textPrimary: string;
  textSecondary: string;
}

export const THEME_COLORS: Record<string, ThemeColors> = {
  'aurora-blue': {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
    atmosphere: 'rgba(96, 165, 250, 0.2)',
    accent: '#60A5FA',
    shadow: 'rgba(30, 58, 138, 0.6)',
    textPrimary: '#E0F2FE',
    textSecondary: '#BAE6FD',
  },

  'solar-gold': {
    primary: '#B45309',
    secondary: '#F59E0B',
    glow: 'rgba(251, 191, 36, 0.5)',
    atmosphere: 'rgba(252, 211, 77, 0.25)',
    accent: '#FBBF24',
    shadow: 'rgba(146, 64, 14, 0.6)',
    textPrimary: '#FEF3C7',
    textSecondary: '#FDE68A',
  },

  'crimson-nova': {
    primary: '#991B1B',
    secondary: '#DC2626',
    glow: 'rgba(239, 68, 68, 0.45)',
    atmosphere: 'rgba(252, 165, 165, 0.2)',
    accent: '#EF4444',
    shadow: 'rgba(127, 29, 29, 0.65)',
    textPrimary: '#FEE2E2',
    textSecondary: '#FECACA',
  },

  'emerald-pulse': {
    primary: '#065F46',
    secondary: '#10B981',
    glow: 'rgba(52, 211, 153, 0.4)',
    atmosphere: 'rgba(110, 231, 183, 0.2)',
    accent: '#34D399',
    shadow: 'rgba(6, 78, 59, 0.6)',
    textPrimary: '#D1FAE5',
    textSecondary: '#A7F3D0',
  },

  'violet-drift': {
    primary: '#5B21B6',
    secondary: '#8B5CF6',
    glow: 'rgba(167, 139, 250, 0.45)',
    atmosphere: 'rgba(196, 181, 253, 0.2)',
    accent: '#A78BFA',
    shadow: 'rgba(76, 29, 149, 0.65)',
    textPrimary: '#EDE9FE',
    textSecondary: '#DDD6FE',
  },

  'silver-orbit': {
    primary: '#374151',
    secondary: '#9CA3AF',
    glow: 'rgba(209, 213, 219, 0.35)',
    atmosphere: 'rgba(229, 231, 235, 0.15)',
    accent: '#D1D5DB',
    shadow: 'rgba(31, 41, 55, 0.7)',
    textPrimary: '#F3F4F6',
    textSecondary: '#E5E7EB',
  },
};

export const getThemeColors = (theme: string): ThemeColors => {
  return THEME_COLORS[theme] || THEME_COLORS['aurora-blue'];
};

export const LEVEL_EFFECTS = {
  low: {
    glowMultiplier: 1.0,
    pulseSpeed: 'none' as const,
    addRings: false,
    addAura: false,
  },

  mid: {
    glowMultiplier: 1.3,
    pulseSpeed: 'slow' as const,
    addRings: false,
    addAura: false,
  },

  high: {
    glowMultiplier: 1.6,
    pulseSpeed: 'medium' as const,
    addRings: true,
    addAura: false,
  },

  max: {
    glowMultiplier: 2.0,
    pulseSpeed: 'fast' as const,
    addRings: true,
    addAura: true,
  },
};

export const getLevelEffects = (level: number) => {
  if (level >= 11) return LEVEL_EFFECTS.max;
  if (level >= 6) return LEVEL_EFFECTS.high;
  if (level >= 3) return LEVEL_EFFECTS.mid;
  return LEVEL_EFFECTS.low;
};

export const ANIMATION_TIMINGS = {
  transition: 300,
  transitionSlow: 500,
  transitionFast: 150,

  orbitSlow: 20,
  orbitMedium: 35,
  orbitFast: 50,

  pulseSpeed: {
    none: 0,
    slow: 4,
    medium: 2.5,
    fast: 1.5,
  },
};

export const getOrbitSpeed = (level: number): number => {
  if (level >= 6) return ANIMATION_TIMINGS.orbitFast;
  if (level >= 3) return ANIMATION_TIMINGS.orbitMedium;
  return ANIMATION_TIMINGS.orbitSlow;
};

export const PLANET_SIZE_SCALE: Record<number, number> = {
  1: 1.0,
  3: 1.2,
  6: 1.4,
  10: 1.6,
  15: 1.8,
};

export const getPlanetSizeMultiplier = (level: number): number => {
  if (level >= 15) return PLANET_SIZE_SCALE[15];
  if (level >= 10) return PLANET_SIZE_SCALE[10];
  if (level >= 6) return PLANET_SIZE_SCALE[6];
  if (level >= 3) return PLANET_SIZE_SCALE[3];
  return PLANET_SIZE_SCALE[1];
};
