import React from 'react';
import { formatDate, formatDuration } from '../../utils/formatDate';

const HandlerInfo = ({ authority, assignedAt, handlingFor }) => {
  if (!authority) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-medium">
          ⏳ Awaiting assignment to division officer
        </p>
      </div>
    );
  }

  // Calculate if SLA is breached (assuming 7 days SLA)
  const assignedDate = new Date(assignedAt);
  const now = new Date();
  const daysSinceAssigned = Math.floor((now - assignedDate) / (1000 * 60 * 60 * 24));
  const isOverdue = daysSinceAssigned > 7;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ borderLeft: '4px solid #3182ce' }}>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-2">Currently Handled By</p>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{authority.name}</h3>
        
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
          {authority.designation}
        </span>
        
        <p className="text-sm text-gray-600 mb-3">{authority.department}</p>
        
        <div className="border-t border-gray-200 pt-3 mb-3 space-y-2">
          {(authority.division || authority.zone || authority.ward) && (
            <p className="text-sm text-gray-700">
              📍 {authority.division && `Division: ${authority.division}`}
              {authority.zone && `, Zone: ${authority.zone}`}
              {authority.ward && `, Ward: ${authority.ward}`}
            </p>
          )}
          
          {authority.jurisdictionArea && (
            <p className="text-sm text-gray-700">
              📋 Jurisdiction: {authority.jurisdictionArea}
            </p>
          )}
          
          {authority.email && (
            <p className="text-sm">
              ✉️{' '}
              <a 
                href={`mailto:${authority.email}`}
                className="text-blue-600 hover:underline"
              >
                {authority.email}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-blue-50 px-4 py-3 space-y-1">
        {assignedAt && (
          <p className="text-xs text-gray-700">
            <span className="font-medium">Accepted on:</span> {formatDate(assignedAt)}
          </p>
        )}
        {handlingFor && (
          <p className="text-xs text-gray-700">
            <span className="font-medium">Handling for:</span> {handlingFor}
          </p>
        )}
        {isOverdue && (
          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold mt-2">
            ⚠️ SLA Breached
          </span>
        )}
      </div>
    </div>
  );
};

export default HandlerInfo;
