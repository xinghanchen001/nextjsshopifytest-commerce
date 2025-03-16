'use client';

export function TextCustomizationInput({
  label,
  value,
  onChange,
  maxLength,
  error,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`block w-full rounded-md border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
        />
        <div className="mt-1 flex justify-between">
          <p
            className={`text-xs ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {error || `${value.length}/${maxLength} characters`}
          </p>
        </div>
      </div>
    </div>
  );
}
