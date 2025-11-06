import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  required,
  disabled,
  className = '',
  ...inputProps
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'error-message' : helpText ? 'help-text' : undefined}
        {...inputProps}
      />
      {error && (
        <p id="error-message" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id="help-text" className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};
