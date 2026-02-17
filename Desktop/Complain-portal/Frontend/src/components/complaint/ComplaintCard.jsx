import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatRelative } from '../../utils/formatDate';
import { getPriorityColor } from '../../utils/statusHelpers';

const ComplaintCard = ({ complaint, onClick }) => {
  const {
    complaintId,
    title,
    category,
    priority,
    address,
    division,
    status,
    handler,
    createdAt,
    slaDeadline
  } = complaint;

  // Check if overdue
  const isOverdue = slaDeadline && new Date(slaDeadline) < new Date() && 
                    status !== 'resolved' && status !== 'closed';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      {/* Top Row: ID and Status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-mono">
          {complaintId}
        </span>
        <StatusBadge status={status} />
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 mb-2 truncate">
        {title}
      </h3>

      {/* Category and Priority */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm text-gray-600">
          {category}
        </span>
        <span 
          className="text-xs font-semibold uppercase px-2 py-0.5 rounded"
          style={{ 
            color: getPriorityColor(priority),
            backgroundColor: `${getPriorityColor(priority)}20`
          }}
        >
          {priority}
        </span>
      </div>

      {/* Location */}
      <div className="text-sm text-gray-600 mb-2">
        📍 {address}{division ? `, ${division}` : ''}
      </div>

      {/* SLA Warning */}
      {isOverdue && (
        <div className="text-red-600 text-sm font-medium mb-2">
          ⚠️ Overdue
        </div>
      )}
      {!isOverdue && slaDeadline && status !== 'resolved' && status !== 'closed' && (
        <div className="text-gray-600 text-sm mb-2">
          {Math.ceil((new Date(slaDeadline) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
        </div>
      )}

      {/* Handler Info */}
      {handler && (
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-medium">Handling:</span> {handler.name} — {handler.designation}
          {handler.division && `, ${handler.division}`}
        </div>
      )}

      {/* Created Date */}
      <div className="text-xs text-gray-500 mt-3">
        {formatRelative(createdAt)}
      </div>
    </div>
  );
};

export default ComplaintCard;
