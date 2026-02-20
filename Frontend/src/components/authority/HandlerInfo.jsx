import React from 'react';
import { formatDate } from '../../utils/formatDate';

/**
 * HandlerInfo — shows who is currently handling a complaint.
 * @param {Object} authority   - The User document (currentAuthority field on complaint),
 *                               which has authorityInfo.{designation, department, division, zone, ward}
 * @param {string} assignedAt  - ISO timestamp when complaint was accepted
 */
const HandlerInfo = ({ authority, assignedAt }) => {
  if (!authority) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-medium text-sm">
          ⏳ Awaiting assignment to a division officer
        </p>
      </div>
    );
  }

  const info = authority.authorityInfo || {};

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      style={{ borderLeft: '4px solid #3182ce' }}
    >
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">Currently Handled By</p>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{authority.name}</h3>

        {info.designation && (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
            {info.designation}
          </span>
        )}

        {info.department && (
          <p className="text-sm text-gray-600 mb-3">{info.department}</p>
        )}

        <div className="border-t border-gray-200 pt-3 space-y-2">
          {(info.division || info.zone || info.ward) && (
            <p className="text-sm text-gray-700">
              📍{info.division && ` Division: ${info.division}`}
              {info.zone && `, Zone: ${info.zone}`}
              {info.ward && `, Ward: ${info.ward}`}
            </p>
          )}

          {info.jurisdictionArea && (
            <p className="text-sm text-gray-700">
              📋 Jurisdiction: {info.jurisdictionArea}
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

      {assignedAt && (
        <div className="bg-blue-50 px-4 py-3">
          <p className="text-xs text-gray-700">
            <span className="font-medium">Accepted on:</span>{' '}
            {formatDate(assignedAt)}
          </p>
        </div>
      )}
    </div>
  );
};

export default HandlerInfo;
