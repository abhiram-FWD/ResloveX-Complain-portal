export const getStatusColor = (status) => ({
  submitted:            '#718096',
  assigned:             '#3182ce',
  accepted:             '#553c9a',
  in_progress:          '#d69e2e',
  pending_verification: '#dd6b20',
  resolved:             '#38a169',
  rejected:             '#e53e3e',
  escalated:            '#c53030',
  reopened:             '#805ad5',
}[status] || '#718096');

export const getStatusLabel = (status) => ({
  submitted:            'Submitted',
  assigned:             'Assigned',
  accepted:             'Accepted',
  in_progress:          'In Progress',
  pending_verification: 'Pending Verification',
  resolved:             'Resolved',
  rejected:             'Rejected',
  escalated:            'Escalated',
  reopened:             'Reopened',
}[status] || status);

export const getActionLabel = (action) => ({
  submitted:   'Complaint Submitted',
  assigned:    'Auto-Assigned to Department',
  accepted:    'Accepted by Authority',
  forwarded:   'Forwarded to Another Officer',
  in_progress: 'Marked as In Progress',
  resolved:    'Marked as Resolved',
  rejected:    'Complaint Rejected',
  escalated:   'Escalated — SLA Breached',
  reopened:    'Reopened by Citizen',
  verified:    'Resolution Verified by Citizen',
  closed:      'Complaint Closed',
}[action] || action);

export const getPriorityColor = (priority) => ({
  low:    '#718096',
  medium: '#3182ce',
  high:   '#d69e2e',
  urgent: '#e53e3e',
}[priority] || '#718096');
