import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) =>
  format(new Date(date), 'dd MMM yyyy, h:mm a');

export const formatRelative = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDuration = (ms) => {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

export const calculateSLARemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  return {
    isOverdue: diff < 0,
    daysRemaining: Math.floor(Math.abs(diff) / 86400000),
    hoursRemaining: Math.floor((Math.abs(diff) % 86400000) / 3600000),
    percentUsed: Math.min(100, Math.max(0,
      ((7 * 86400000 - diff) / (7 * 86400000)) * 100))
  };
};
