import React from 'react';
import { formatDate } from '../../utils/formatDate';

const ComplaintTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-gray-500 text-sm">No timeline entries yet.</p>;
  }

  const getCircleColor = (action) => {
    const colorMap = {
      submitted:    'bg-gray-400',
      accepted:     'bg-blue-500',
      forwarded:    'bg-orange-500',
      in_progress:  'bg-yellow-500',
      resolved:     'bg-green-500',
      escalated:    'bg-red-500',
      reopened:     'bg-purple-500',
      verified:     'bg-green-500'
    };
    return colorMap[action] || 'bg-gray-400';
  };

  // Helper to get name safely from a populated user object
  const getName = (user) => user?.name || '—';
  const getDesignation = (user) => user?.authorityInfo?.designation || '';
  const getDepartment = (user) => user?.authorityInfo?.department || '';
  const getDivision = (user) => user?.authorityInfo?.division || '';
  const getZone = (user) => user?.authorityInfo?.zone || '';

  return (
    <div className="space-y-6">
      {timeline.map((entry, index) => (
        <div key={index} className="relative flex gap-4">
          {/* Vertical line */}
          {index < timeline.length - 1 && (
            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-300" />
          )}

          {/* Circle */}
          <div className={`w-4 h-4 rounded-full ${getCircleColor(entry.action)} flex-shrink-0 mt-1 z-10`}>
            {entry.action === 'verified' && (
              <span className="text-white text-xs flex items-center justify-center">✓</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">

            {/* SUBMITTED */}
            {entry.action === 'submitted' && (
              <div>
                <p className="font-medium text-gray-900">Complaint submitted</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* ACCEPTED */}
            {entry.action === 'accepted' && (
              <div>
                <p className="font-medium text-gray-900">
                  Accepted by: <span className="font-bold">{getName(entry.performedBy)}</span>
                  {getDesignation(entry.performedBy) && ` — ${getDesignation(entry.performedBy)}`}
                </p>
                {getDepartment(entry.performedBy) && (
                  <p className="text-sm text-gray-700 mt-1">
                    Department: {getDepartment(entry.performedBy)}
                    {getDivision(entry.performedBy) && ` | Division: ${getDivision(entry.performedBy)}`}
                    {getZone(entry.performedBy) && `, Zone: ${getZone(entry.performedBy)}`}
                  </p>
                )}
                {entry.details && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{entry.details}"</p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* FORWARDED */}
            {entry.action === 'forwarded' && (
              <div>
                <p className="font-medium text-gray-900">
                  Forwarded by: <span className="font-bold">{getName(entry.performedBy)}</span>
                  {getDesignation(entry.performedBy) && `, ${getDesignation(entry.performedBy)}`}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  To: <span className="font-semibold">{getName(entry.toAuthority)}</span>
                  {getDesignation(entry.toAuthority) && `, ${getDesignation(entry.toAuthority)}`}
                  {getDivision(entry.toAuthority) && `, ${getDivision(entry.toAuthority)}`}
                </p>
                {entry.details && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                    <p className="text-sm text-orange-900 italic">"{entry.details}"</p>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2">📌 This transfer is permanently recorded</p>
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* IN_PROGRESS */}
            {entry.action === 'in_progress' && (
              <div>
                <p className="font-medium text-gray-900">
                  Marked In Progress by <span className="font-bold">{getName(entry.performedBy)}</span>
                </p>
                {entry.details && (
                  <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* RESOLVED */}
            {entry.action === 'resolved' && (
              <div>
                <p className="font-medium text-gray-900">
                  Marked resolved by <span className="font-bold">{getName(entry.performedBy)}</span>
                  {getDesignation(entry.performedBy) && `, ${getDesignation(entry.performedBy)}`}
                </p>
                {entry.details && (
                  <p className="text-sm text-gray-700 mt-2 bg-green-50 border border-green-200 rounded p-2">
                    {entry.details}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* ESCALATED */}
            {entry.action === 'escalated' && (
              <div>
                <p className="font-medium text-red-600">⚠️ Auto-escalated — SLA deadline exceeded</p>
                {entry.toAuthority && (
                  <p className="text-sm text-gray-700 mt-1">
                    Escalated to: <span className="font-semibold">{getName(entry.toAuthority)}</span>
                    {getDesignation(entry.toAuthority) && `, ${getDesignation(entry.toAuthority)}`}
                    {getDivision(entry.toAuthority) && `, ${getDivision(entry.toAuthority)}`}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* REOPENED */}
            {entry.action === 'reopened' && (
              <div>
                <p className="font-medium text-purple-600">❌ Citizen rejected resolution</p>
                {entry.details && (
                  <p className="text-sm text-gray-700 mt-2 bg-purple-50 border border-purple-200 rounded p-2">
                    Reason: "{entry.details}"
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* VERIFIED */}
            {entry.action === 'verified' && (
              <div>
                <p className="font-medium text-green-600">✅ Resolution confirmed by citizen</p>
                {entry.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= entry.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                )}
                {entry.feedback && (
                  <p className="text-sm text-gray-700 mt-2 bg-green-50 border border-green-200 rounded p-2">
                    "{entry.feedback}"
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintTimeline;