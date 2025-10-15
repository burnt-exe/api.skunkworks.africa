/**
 * @fileoverview Defines the EasyFileLogo component, a reusable SVG logo.
 * It accepts standard SVG props like width, height, and className, allowing
 * for flexible styling and sizing across the application.
 *
 * The logo features a stylized 'E' and 'F' combined into a single mark,
 * representing the brand identity of EasyFile.
 */
import * as React from 'react';

// Define the props interface for type safety and clarity
interface EasyFileLogoProps extends React.SVGProps<SVGSVGElement> {}

export const EasyFileLogo: React.FC<EasyFileLogoProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="EasyFile Logo"
    {...props} // Spread remaining props for flexibility
  >
    {/* Background shape */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="hsl(var(--primary))" stroke="none" />

    {/* Folded corner effect */}
    <polyline points="14 2 14 8 20 8" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />

    {/* 'EF' Letters - Stylized for 'EasyFile' */}
    <line x1="10" y1="12" x2="10" y2="18" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
    <line x1="10" y1="12" x2="14" y2="12" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
    <line x1="10" y1="15" x2="13" y2="15" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
  </svg>
);
