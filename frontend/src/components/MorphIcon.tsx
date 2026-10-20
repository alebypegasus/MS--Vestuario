import React from 'react';
import { MorphIcon as BaseMorphIcon } from 'morphicons/react';
import type { IconInput, IconNode } from 'morphicons';
import * as LucideIcons from 'lucide';

export interface IMorphIconProps {
  icon?: any;
  from?: any;
  to?: any;
  progress?: number;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  spring?: 'snappy' | 'smooth' | 'bouncy' | { stiffness: number; damping: number };
  label?: string;
}

/**
 * Componente unificado de ícones morphing para todo o projeto MS² Vestuário.
 * Utiliza o motor morphicons com física de mola (spring physics) e ícones vetoriais.
 */
export const MorphIcon: React.FC<IMorphIconProps> = ({
  icon,
  from,
  to,
  progress,
  size = 20,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  spring = 'snappy',
  label,
}) => {
  return (
    <BaseMorphIcon
      icon={icon}
      from={from}
      to={to}
      progress={progress}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      spring={spring}
      label={label}
    />
  );
};

// Exporta também os tipos e o conjunto de nós de ícones do lucide para morphicons
export type { IconNode, IconInput };
export { LucideIcons };
