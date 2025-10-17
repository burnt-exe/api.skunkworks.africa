/**
 * @fileoverview Defines the EasyFileLogo component, a reusable SVG logo.
 * It accepts standard SVG props like width, height, and className, allowing
 * for flexible styling and sizing across the application.
 *
 * The logo features a stylized folder with an upload arrow, representing the brand identity of EasyFile.
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
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1D8EFF' }} />
          <stop offset="100%" style={{ stopColor: '#00B4FF' }} />
        </linearGradient>
      </defs>
      {/* Background with rounded corners */}
      <rect width="100" height="100" rx="20" fill="url(#logo-gradient)" />
      
      {/* Folder shape */}
      <path
        fill="#FFFFFF"
        d="M20,30 a5,5 0 0,0 -5,5 v30 a5,5 0 0,0 5,5 h60 a5,5 0 0,0 5,-5 v-30 a5,5 0 0,0 -5,-5 h-30 l-5,-5 h-25 a5,5 0 0,0 -5,5 z"
        transform="translate(0, 5)"
      />
      
      {/* Upload Arrow */}
      <g transform="translate(0, -5)">
        <path
          fill="#FFFFFF"
          d="M50 35 L60 45 L52 45 L52 55 L48 55 L48 45 L40 45 Z"
        />
      </g>
    </svg>
);
