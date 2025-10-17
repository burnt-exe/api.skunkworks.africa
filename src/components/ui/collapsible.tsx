'use client';

import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';

/**
 * Collapsible — a composable wrapper around Radix's Collapsible primitives.
 * Provides animated open/close transitions and a styled trigger/content API.
 *
 * Usage:
 *  <Collapsible>
 *    <CollapsibleTrigger>Toggle</CollapsibleTrigger>
 *    <CollapsibleContent>Hidden content here</CollapsibleContent>
 *  </Collapsible>
 */

// Root container (unchanged, just re-exported for clarity)
const Collapsible = CollapsiblePrimitive.Root;

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-medium',
      'hover:bg-accent hover:text-accent-foreground transition-colors duration-200 select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      className
    )}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Trigger>
));

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden',
      // smooth height transitions + fade effect
      'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
      'transition-all duration-300 ease-out',
      className
    )}
    {...props}
  >
    <div className="pt-2">{children}</div>
  </CollapsiblePrimitive.Content>
));

CollapsibleContent.displayName = 'CollapsibleContent';

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
