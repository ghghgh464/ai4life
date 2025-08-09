import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Đang tải...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Modern loading animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 animate-pulse`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin`}></div>
        <div className={`absolute inset-2 ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-blue-400 to-purple-600 animate-ping opacity-20`}></div>
      </div>
      
      {/* AI Robot emoji with bounce */}
      <div className="mt-6 text-4xl animate-bounce">🤖</div>
      
      {message && (
        <div className="mt-4 text-center">
          <p className="text-gray-700 font-medium text-lg">{message}</p>
          <p className="text-gray-500 text-sm mt-1">AI đang phân tích dữ liệu của bạn...</p>
        </div>
      )}
      
      {/* Loading dots */}
      <div className="flex space-x-1 mt-6">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
