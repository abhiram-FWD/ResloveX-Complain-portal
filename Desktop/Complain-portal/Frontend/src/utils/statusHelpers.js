export const getStatusColor = (status) => {
  switch (status) {
    case 'submitted': return 'bg-yellow-100 text-yellow-800';
    case 'accepted': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-purple-100 text-purple-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'escalated': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'text-red-600 font-bold';
    case 'medium': return 'text-yellow-600 font-medium';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};
