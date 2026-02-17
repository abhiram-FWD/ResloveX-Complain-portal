import React from 'react';

const HandlerInfo = ({ handler }) => {
  if (!handler) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Handler Information</h3>
        <p className="text-sm text-gray-500">Not yet assigned to an officer</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Handler Information</h3>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Name</p>
          <p className="text-sm font-medium text-gray-900">{handler.name}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Designation</p>
          <p className="text-sm text-gray-700">{handler.designation}</p>
        </div>

        {handler.department && (
          <div>
            <p className="text-xs text-gray-500">Department</p>
            <p className="text-sm text-gray-700">{handler.department}</p>
          </div>
        )}

        {handler.division && (
          <div>
            <p className="text-xs text-gray-500">Division</p>
            <p className="text-sm text-gray-700">{handler.division}</p>
          </div>
        )}

        {handler.zone && (
          <div>
            <p className="text-xs text-gray-500">Zone</p>
            <p className="text-sm text-gray-700">{handler.zone}</p>
          </div>
        )}

        {handler.email && (
          <div>
            <p className="text-xs text-gray-500">Contact</p>
            <a 
              href={`mailto:${handler.email}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {handler.email}
            </a>
          </div>
        )}

        {handler.phone && (
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm text-gray-700">{handler.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandlerInfo;
