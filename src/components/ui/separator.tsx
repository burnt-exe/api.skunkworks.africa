'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

/**
 * Separator — a simple horizontal or vertical divider.
 *
 * Wraps Radix UI's SeparatorPrimitive to provide consistent styling,
 * theme awareness, and alignment with your design system.
 *
 * Example:
 *   <Separator className="my-4" />
 *   <div className="flex items-center space-x-4">
 *     <span>Left</span>
 *     <Separator orientation="vertical" />
 *     <span>Right</span>
 *   </div>
 */

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        // Default base styles
        'shrink-0 bg-border',
        // Orientation-specific dimensions
        orientation === 'horizontal'
          ? 'h-[1px] w-full'
          : 'h-full w-[1px]',
        // Smooth color transition (for theme switching)
        'transition-colors duration-200 ease-in-out',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';

export { Separator };
