import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/statusHelpers';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <span 
      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
      style={{ 
        backgroundColor: `${color}20`, 
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      ● {label}
    </span>
  );
};

export default StatusBadge;
