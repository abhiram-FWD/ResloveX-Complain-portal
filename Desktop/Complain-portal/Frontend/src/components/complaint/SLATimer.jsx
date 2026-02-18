import React, { useState, useEffect } from 'react';
import { calculateSLARemaining } from '../../utils/formatDate';
import { getStatusColor } from '../../utils/statusHelpers';

const SLATimer = ({ deadline, createdAt, status }) => {
  const [slaData, setSlaData] = useState(null);

  useEffect(() => {
    if (status === 'resolved' || status === 'closed') {
      return;
    }

    const updateSLA = () => {
      if (deadline) {
        setSlaData(calculateSLARemaining(deadline));
      }
    };

    updateSLA();
    const interval = setInterval(updateSLA, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [deadline, status]);

  // If resolved or closed
  if (status === 'resolved' || status === 'closed') {
    return (
      <div className="text-green-600 font-medium flex items-center gap-1">
        ✅ Resolved
      </div>
    );
  }

  if (!slaData) return null;

  const { isOverdue, daysRemaining, hoursRemaining, percentUsed } = slaData;

  // Determine color based on percentage used
  let barColor = '#38a169'; // green
  if (percentUsed > 80) {
    barColor = '#e53e3e'; // red
  } else if (percentUsed > 50) {
    barColor = '#d69e2e'; // yellow
  }

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${Math.min(percentUsed, 100)}%`,
            backgroundColor: barColor
          }}
        />
      </div>

      {/* Time Remaining Text */}
      {isOverdue ? (
        <div className="text-red-600 font-bold text-sm">
          ⚠️ OVERDUE by {daysRemaining > 0 ? `${daysRemaining} days` : `${hoursRemaining} hours`}
        </div>
      ) : (
        <div className="text-gray-700 text-sm">
          {daysRemaining > 0 
            ? `${daysRemaining} days ${hoursRemaining} hours remaining`
            : `${hoursRemaining} hours remaining`
          }
        </div>
      )}

      {/* Deadline Date */}
      <div className="text-gray-500 text-xs">
        Deadline: {new Date(deadline).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default SLATimer;
