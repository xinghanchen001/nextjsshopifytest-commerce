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
  const hatStyle = useMemo(() => {
    return style?.toLowerCase() || 'classic';
  }, [style]);

  const hatColor = useMemo(() => {
    return color?.toLowerCase() || 'black';
  }, [color]);

  // Image path based on style and color
  const imagePath = `/images/hats/${hatStyle}/${hatColor}.png`;

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

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Hat image */}
        <div className="relative h-48 w-48">
          <img
            src={imagePath}
            alt={`${color} ${style} hat`}
            className="h-full w-full object-contain"
          />

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
