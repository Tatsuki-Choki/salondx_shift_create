import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 border-black border-t-transparent animate-spin`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;