import React from 'react';
import { getStatusColor, getStatusLabel } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const statusClasses = getStatusColor(status);

  return (
    <span className={`${baseClasses} ${statusClasses} ${className}`}>{getStatusLabel(status)}</span>
  );
};

export default StatusBadge;
