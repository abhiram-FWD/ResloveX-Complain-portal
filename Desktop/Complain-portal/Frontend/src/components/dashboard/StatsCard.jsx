import React from 'react';

const StatsCard = ({ title, value, subtitle, color = '#3182ce', icon: Icon }) => {
  return (
    <div 
      className="bg-white rounded-lg p-6 transition-shadow duration-200 hover:shadow-lg"
      style={{ 
        borderRadius: '12px',
        borderLeft: `4px solid ${color}`,
        padding: '1.5rem'
      }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        {Icon && (
          <div 
            className="p-2 rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p 
        className="text-3xl font-bold mb-1"
        style={{ color }}
      >
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export default StatsCard;
