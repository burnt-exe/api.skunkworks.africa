/**
 * @fileoverview Defines the EasyFileLogo component, a reusable SVG logo.
 * It accepts standard SVG props like width, height, and className, allowing
 * for flexible styling and sizing across the application.
 */
import * as React from 'react';

// Define the props interface for type safety and clarity
interface EasyFileLogoProps extends React.SVGProps<SVGSVGElement> {}

export const EasyFileLogo: React.FC<EasyFileLogoProps> = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-label="EasyFile Logo"
      {...props}
    >
      {/* Background */}
      <rect width="100" height="100" rx="18" fill="#1D8EFF" />

      {/* Folder Icon */}
      <path
        fill="#000000"
        d="M19 28 C16.25 28 14 30.25 14 33 L14 68 C14 70.75 16.25 73 19 73 L81 73 C83.75 73 86 70.75 86 68 L86 40 C86 37.25 83.75 35 81 35 L48 35 L43 30 C42.333 29.333 41.667 28.667 41 28 L19 28 Z"
      />
      
      {/* Upload Arrow inside folder */}
      <g transform="translate(0, 5)">
         <path
            fill="#1D8EFF"
            d="M50 40 L40 50 L46 50 L46 60 L54 60 L54 50 L60 50 Z"
          />
      </g>

       {/* Text */}
      <text x="50" y="90" fontFamily="sans-serif" fontSize="18" fill="#000000" textAnchor="middle" fontWeight="bold">
        EasyFile
      </text>
    </svg>
);
