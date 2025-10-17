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
        <style>
          {`.folder-fill { fill: #3b82f6; } .arrow-fill { fill: #3b82f6; } .folder-icon-fill { fill: #000000; }`}
        </style>
      </defs>
      <rect width="100" height="100" rx="20" className="folder-fill" />
      <path
        className="folder-icon-fill"
        d="M20,25 h25 l5,-5 h30 a5,5 0 0,1 5,5 v40 a5,5 0 0,1 -5,5 h-60 a5,5 0 0,1 -5,-5 v-30 a5,5 0 0,1 5,-5 z"
      />
      <path
        className="arrow-fill"
        d="M50,35 l-10,10 h5 v10 h10 v-10 h5 z"
      />
      <text x="50" y="85" textAnchor="middle" fontSize="14" fill="#000000" fontWeight="bold">EasyFile</text>
    </svg>
);