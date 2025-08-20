import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors font-medium';
  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500' 
    : 'border-gray-300 focus:border-black';
  
  const iconClasses = Icon ? 'pl-12' : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          className={`${baseClasses} ${errorClasses} ${iconClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;