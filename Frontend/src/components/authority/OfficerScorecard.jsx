import React, { useState, useEffect } from 'react';
import { getOfficerScorecard } from '../../services/complaintService';
import Loader from '../common/Loader';

const OfficerScorecard = ({ authorityId, stats }) => {
  const [data, setData] = useState(stats || null);
  const [loading, setLoading] = useState(!stats && !!authorityId);

  useEffect(() => {
    if (authorityId && !stats) {
      const fetchScorecard = async () => {
        try {
          const response = await getOfficerScorecard(authorityId);
          setData(response);
        } catch (err) {
          console.error('Failed to fetch scorecard:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchScorecard();
    }
  }, [authorityId, stats]);

  if (loading) {
    return <Loader />;
  }

  if (!data) {
    return <p className="text-gray-500 text-sm">No scorecard data available</p>;
  }

  const onTimePercent = data.totalHandled > 0 
    ? Math.round((data.resolvedOnTime / data.totalHandled) * 100) 
    : 0;

  const avgDays = data.avgResolutionTime || 0;
  const rating = Number(data.averageRating || data.citizenSatisfaction || 0);
  const falseClosures = data.falseClosuresCaught || 0;
  const escalations = data.escalations || data.escalationsCaught || 0;

  // Determine badge
  let badge = null;
  if (rating > 4 && onTimePercent > 80) {
    badge = { text: '⭐ Top Performer', color: 'bg-green-100 text-green-700' };
  } else if (falseClosures > 5) {
    badge = { text: '⚠️ Under Review', color: 'bg-red-100 text-red-700' };
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
        <p className="text-sm text-gray-600">{data.designation} — {data.department}</p>
        <div className="flex gap-2 mt-2">
          {data.division && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {data.division}
            </span>
          )}
          {data.zone && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {data.zone}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Total Handled</p>
          <p className="text-2xl font-bold text-gray-900">{data.totalHandled}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Resolved On Time</p>
          <p className={`text-2xl font-bold ${onTimePercent > 70 ? 'text-green-600' : 'text-gray-900'}`}>
            {data.resolvedOnTime} ({onTimePercent}%)
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Avg Resolution Time</p>
          <p className={`text-2xl font-bold ${avgDays < 5 ? 'text-green-600' : 'text-gray-900'}`}>
            {avgDays} days
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Citizen Satisfaction</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-gray-900">⭐ {rating.toFixed(1)}/5</p>
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">False Closures Caught</p>
          <p className={`text-2xl font-bold ${falseClosures > 3 ? 'text-red-600' : 'text-gray-900'}`}>
            {falseClosures}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Escalations</p>
          <p className={`text-2xl font-bold ${escalations > 2 ? 'text-orange-600' : 'text-gray-900'}`}>
            {escalations}
          </p>
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div className="border-t border-gray-200 pt-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default OfficerScorecard;
