import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, 'dd MMM yyyy, h:mm a');
};

export const formatRelative = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatDuration = (ms) => {
  if (!ms || isNaN(ms)) return '—';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

export const calculateSLARemaining = (deadline) => {
  if (!deadline) return { isOverdue: false, daysRemaining: 0, hoursRemaining: 0, percentUsed: 0 };
  const now = new Date();
  const end = new Date(deadline);
  if (isNaN(end.getTime())) return { isOverdue: false, daysRemaining: 0, hoursRemaining: 0, percentUsed: 0 };
  const diff = end - now;
  return {
    isOverdue: diff < 0,
    daysRemaining: Math.floor(Math.abs(diff) / 86400000),
    hoursRemaining: Math.floor((Math.abs(diff) % 86400000) / 3600000),
    percentUsed: Math.min(100, Math.max(0,
      ((7 * 86400000 - diff) / (7 * 86400000)) * 100))
  };
};