import React from 'react';
import type { User } from '../types';

const LEVEL_CONFIG = {
  beginner: { label: '🌱 Beginner', className: 'level-beginner' },
  pro:      { label: '⭐ Pro',      className: 'level-pro' },
  expert:   { label: '🏆 Expert',   className: 'level-expert' },
};

interface Props {
  level: User['level'];
  showXP?: boolean;
  xp?: number;
}

const LevelBadge = ({ level, showXP, xp }: Props) => {
  const cfg = LEVEL_CONFIG[level];
  return (
    <span className={cfg.className}>
      {cfg.label}
      {showXP && xp !== undefined && (
        <span className="ml-1 opacity-70">({xp} XP)</span>
      )}
    </span>
  );
};

export default LevelBadge;
