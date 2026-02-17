export const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case 'submitted':
      return 'bg-gray-100 text-gray-800';
    case 'assigned':
      return 'bg-blue-100 text-blue-800';
    case 'accepted':
      return 'bg-indigo-100 text-indigo-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending_verification':
      return 'bg-orange-100 text-orange-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'escalated':
      return 'bg-red-100 text-red-800 font-bold';
    case 'reopened':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority) => {
  const normalizedPriority = priority?.toLowerCase();
  switch (normalizedPriority) {
    case 'high':
      return 'text-red-600 font-bold';
    case 'medium':
      return 'text-yellow-600 font-medium';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const getActionLabel = (action) => {
  switch (action) {
    case 'submitted': return 'Complaint Submitted';
    case 'accepted': return 'Accepted by Authority';
    case 'forwarded': return 'Forwarded to Another Officer';
    case 'escalated': return 'Escalated — SLA Breached';
    case 'resolved': return 'Resolved';
    case 'rejected': return 'Rejected';
    case 'reopened': return 'Reopened';
    case 'pending_verification': return 'Pending Verification';
    case 'assigned': return 'Assigned to Officer';
    default: return action?.replace(/_/g, ' ') || 'Unknown Action';
  }
};
