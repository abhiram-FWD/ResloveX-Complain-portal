import React from 'react';

const Loader = ({ text = "Loading...", full = false }) => {
  const containerClasses = full 
    ? "fixed inset-0 z-50 flex flex-col justify-center items-center bg-white bg-opacity-90"
    : "flex flex-col justify-center items-center py-8";

  return (
    <div className={containerClasses}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      {text && <p className="text-gray-600 font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
