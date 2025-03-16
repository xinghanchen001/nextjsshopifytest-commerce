'use client';

import { useMemo } from 'react';

export function HatPreview({
  color,
  style,
  textLine1,
  textLine2,
}: {
  color: string;
  style: string;
  textLine1: string;
  textLine2?: string;
}) {
  // In a real implementation, we would have different hat images for each color and style
  // For this example, we'll use a placeholder and apply color with CSS
  const hatStyle = useMemo(() => {
    // Default style is classic
    return style?.toLowerCase() || 'classic';
  }, [style]);

  // Determine text position based on hat style
  const textPosition = useMemo(() => {
    switch (hatStyle) {
      case 'trucker':
        return 'top-1/3';
      case 'beanie':
        return 'top-1/2';
      case 'classic':
      default:
        return 'top-1/2';
    }
  }, [hatStyle]);

  // Get background color based on selected color
  const backgroundColor = useMemo(() => {
    const colorMap: Record<string, string> = {
      red: '#FF5555',
      blue: '#5555FF',
      black: '#333333',
      white: '#FFFFFF',
      gray: '#AAAAAA',
    };

    return colorMap[color?.toLowerCase()] || '#CCCCCC';
  }, [color]);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        {/* Hat shape - this would be replaced with actual hat images */}
        <div
          className={`relative h-48 w-48 ${
            hatStyle === 'beanie'
              ? 'rounded-b-full'
              : hatStyle === 'trucker'
                ? 'rounded-t-lg'
                : 'rounded-t-full'
          }`}
        >
          {/* Text overlay */}
          <div
            className={`absolute inset-x-0 ${textPosition} flex flex-col items-center justify-center p-4`}
          >
            {textLine1 && (
              <p className="hat-text text-center text-xl font-bold text-black dark:text-white">
                {textLine1}
              </p>
            )}
            {textLine2 && (
              <p className="hat-text mt-1 text-center text-xl font-bold text-black dark:text-white">
                {textLine2}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
