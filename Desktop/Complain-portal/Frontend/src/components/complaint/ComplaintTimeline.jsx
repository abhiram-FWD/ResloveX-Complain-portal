import React from 'react';
import { formatDate } from '../../utils/formatDate';
import { getActionLabel } from '../../utils/statusHelpers';

const ComplaintTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <p className="text-gray-500 text-sm">No timeline entries yet.</p>;
  }

  const getCircleColor = (action) => {
    const colorMap = {
      submitted: 'bg-gray-400',
      accepted: 'bg-blue-500',
      forwarded: 'bg-orange-500',
      in_progress: 'bg-yellow-500',
      resolved: 'bg-green-500',
      escalated: 'bg-red-500',
      reopened: 'bg-purple-500',
      verified: 'bg-green-500'
    };
    return colorMap[action] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {timeline.map((entry, index) => (
        <div key={index} className="relative flex gap-4">
          {/* Vertical Line */}
          {index < timeline.length - 1 && (
            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-300" />
          )}

          {/* Circle Icon */}
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
                  Accepted by: <span className="font-bold">{entry.authority?.name}</span> — {entry.authority?.designation}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Department: {entry.authority?.department}
                  {entry.authority?.division && ` | Division: ${entry.authority.division}`}
                  {entry.authority?.zone && `, Zone: ${entry.authority.zone}`}
                </p>
                {entry.authority?.email && (
                  <a 
                    href={`mailto:${entry.authority.email}`}
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    {entry.authority.email}
                  </a>
                )}
                {entry.note && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{entry.note}"</p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* FORWARDED */}
            {entry.action === 'forwarded' && (
              <div>
                <p className="font-medium text-gray-900">
                  Forwarded by: {entry.fromAuthority?.name}, {entry.fromAuthority?.designation}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  To: <span className="font-semibold">{entry.toAuthority?.name}</span>, {entry.toAuthority?.designation}
                  {entry.toAuthority?.division && `, ${entry.toAuthority.division}`}
                </p>
                {entry.reason && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                    <p className="text-sm text-orange-900 italic">"{entry.reason}"</p>
                  </div>
                )}
                {entry.timeWithPreviousOfficer && (
                  <p className="text-xs text-gray-500 mt-2">
                    Time with previous officer: {entry.timeWithPreviousOfficer}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  📌 This transfer is permanently recorded
                </p>
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* IN_PROGRESS */}
            {entry.action === 'in_progress' && (
              <div>
                <p className="font-medium text-gray-900">
                  Marked In Progress by {entry.authority?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* RESOLVED */}
            {entry.action === 'resolved' && (
              <div>
                <p className="font-medium text-gray-900">
                  Marked resolved by {entry.authority?.name}, {entry.authority?.designation}
                </p>
                {entry.resolutionNote && (
                  <p className="text-sm text-gray-700 mt-2 bg-green-50 border border-green-200 rounded p-2">
                    {entry.resolutionNote}
                  </p>
                )}
                {entry.resolutionPhotos && entry.resolutionPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {entry.resolutionPhotos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Resolution ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* ESCALATED */}
            {entry.action === 'escalated' && (
              <div>
                <p className="font-medium text-red-600">
                  ⚠️ Auto-escalated — SLA deadline exceeded
                </p>
                {entry.escalatedTo && (
                  <p className="text-sm text-gray-700 mt-1">
                    Escalated to: <span className="font-semibold">{entry.escalatedTo.name}</span>, {entry.escalatedTo.designation}
                    {entry.escalatedTo.division && `, ${entry.escalatedTo.division}`}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* REOPENED */}
            {entry.action === 'reopened' && (
              <div>
                <p className="font-medium text-purple-600">
                  ❌ Citizen rejected resolution
                </p>
                {entry.reason && (
                  <p className="text-sm text-gray-700 mt-2 bg-purple-50 border border-purple-200 rounded p-2">
                    Reason: "{entry.reason}"
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.timestamp)}</p>
              </div>
            )}

            {/* VERIFIED */}
            {entry.action === 'verified' && (
              <div>
                <p className="font-medium text-green-600">
                  ✅ Resolution confirmed by citizen
                </p>
                {entry.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= entry.rating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
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
