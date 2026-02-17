import React from 'react';
import { getStatusColor } from '../../utils/statusHelpers';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const formattedStatus = status.split('_').join(' ');

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(status)}`}>
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
