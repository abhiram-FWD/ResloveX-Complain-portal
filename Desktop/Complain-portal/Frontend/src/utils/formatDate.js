import { format, formatDistanceToNow, formatDuration as fnsFormatDuration, intervalToDuration } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'd MMM yyyy, h:mm a');
};

export const formatRelative = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDuration = (ms) => {
  if (!ms || ms < 0) return '0m';
  const duration = intervalToDuration({ start: 0, end: ms });
  return fnsFormatDuration(duration, { format: ['days', 'hours', 'minutes'] });
};

export const calculateSLARemaining = (deadline) => {
  if (!deadline) return { days: 0, hours: 0, isOverdue: false, percentUsed: 0 };
  
  const now = new Date();
  const end = new Date(deadline);
  const totalDuration = 3 * 24 * 60 * 60 * 1000; // Assuming 3 days default SLA for calculation base
  const remaining = end - now;
  const isOverdue = remaining < 0;
  
  const duration = intervalToDuration({ start: now, end: end });
  
  // Calculate percentage used (assuming 3 days standard, or based on creation if available)
  // For now, simpler visual logic:
  const percentUsed = Math.max(0, Math.min(100, 100 - (remaining / totalDuration * 100)));

  return {
    days: duration.days || 0,
    hours: duration.hours || 0,
    minutes: duration.minutes || 0,
    isOverdue,
    percentUsed: isOverdue ? 100 : percentUsed
  };
};
