import React, { useState } from 'react';
import LoadingScreen from './LoadingScreen';

const LoadingScreenDemo = () => {
  const [showLoading, setShowLoading] = useState(false);

  const handleShowLoading = () => {
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {showLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}
      
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Loading Screen Demo
        </h2>
        <p className="text-gray-600 mb-6">
          Click the button below to preview the loading screen
        </p>
        <button
          onClick={handleShowLoading}
          className="bg-[#800000] text-white px-6 py-3 rounded-lg hover:bg-[#660000] transition-colors font-medium"
        >
          Show Loading Screen
        </button>
      </div>
    </div>
  );
};

export default LoadingScreenDemo;
