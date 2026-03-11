import React from 'react';
import { RegulationType } from '../types';

const TYPE_COLORS: Record<RegulationType | string, { bg: string; text: string }> = {
  DECREE: { bg: '#1a3a5c', text: '#e8f0fa' },
  RESOLUTION: { bg: '#0d5c4a', text: '#e0f5ef' },
  ORDINANCE: { bg: '#5c3a0d', text: '#fdf0e0' },
  TRIBUNAL_RESOLUTION: { bg: '#5c1a1a', text: '#fde8e8' },
  BID: { bg: '#3a0d5c', text: '#f0e0fd' },
};

const TYPE_LABELS: Record<RegulationType | string, string> = {
  DECREE: 'Decreto',
  RESOLUTION: 'Resolución',
  ORDINANCE: 'Ordenanza',
  TRIBUNAL_RESOLUTION: 'Resolución Tribunal',
  BID: 'Licitación',
};

interface TypeBadgeProps {
  type: RegulationType;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const colors = TYPE_COLORS[type] || { bg: '#333', text: '#fff' };
  const label = TYPE_LABELS[type] || type;

  return (
    <span
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
};

export default TypeBadge;
