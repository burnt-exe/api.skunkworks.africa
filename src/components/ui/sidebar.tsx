'use client';

import * as React from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SidebarNav } from '../sidebar-nav';

// --------------------------------------------------
// Context Definition
// --------------------------------------------------
interface SidebarContextProps {
  isCollapsed: boolean;
  isMobile: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context)
    throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
}

// --------------------------------------------------
// Provider
// --------------------------------------------------
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  // Use the viewport hook and normalize undefined -> boolean
  const isMobile = useIsMobile();
  const isMobileBool = Boolean(isMobile);

  // Manage collapsed state based on device type
  const [isCollapsed, setCollapsed] = React.useState(
    isMobileBool ? true : defaultCollapsed
  );

  // Re-evaluate when viewport changes
  React.useEffect(() => {
    setCollapsed(isMobileBool ? true : defaultCollapsed);
  }, [isMobileBool, defaultCollapsed]);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, isMobile: isMobileBool, setCollapsed }}
    >
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

// --------------------------------------------------
// Sidebar Component
// --------------------------------------------------
type CollapsibleOption = 'icon' | 'responsive';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: CollapsibleOption;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, collapsible = 'responsive', ...props }, ref) => {
    const { isCollapsed, isMobile, setCollapsed } = useSidebar();
    const handleToggle = () => setCollapsed(!isCollapsed);

    // Determine which mode to use
    const effectiveCollapsible = isMobile ? 'icon' : collapsible;

    // Mobile layout — sidebar as a sheet
    if (isMobile) {
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 right-4 z-50"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[300px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarNav />
          </SheetContent>
        </Sheet>
      );
    }

    // Desktop layout
    return (
      <div
        ref={ref}
        className={cn(
          'h-screen sticky top-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-[280px]',
          'bg-[#0E0E1A] border-r border-white/10 text-white/90',
          className
        )}
        data-collapsible={effectiveCollapsible}
        {...props}
      >
        <div className="relative h-full w-full">
          {children}
          {collapsible === 'responsive' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className={cn(
                'absolute top-1/2 -right-4 transform -translate-y-1/2 rounded-full border bg-background',
                'shadow-md hover:bg-accent hover:text-accent-foreground transition'
              )}
            >
              <ChevronLeft
                className={cn(
                  'transition-transform duration-300',
                  isCollapsed && 'rotate-180'
                )}
              />
            </Button>
          )}
        </div>
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

// --------------------------------------------------
// Layout Components
// --------------------------------------------------
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between p-4 border-b border-white/10',
      'group-data-[collapsible=icon]:justify-center',
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col flex-grow', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('w-full', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

// --------------------------------------------------
// Sidebar Button with Tooltips
// --------------------------------------------------
interface SidebarMenuButtonProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild, isActive, tooltip, ...props }, ref) => {
  const { isCollapsed } = useSidebar();

  const button = (
    <Button
      ref={ref}
      variant="ghost"
      size={isCollapsed ? 'icon' : 'default'}
      className={cn(
        'w-full justify-start hover:bg-white/10 transition-colors',
        isActive &&
          'bg-gradient-to-r from-[#1D8EFF]/20 to-[#00B4FF]/20 text-white font-medium shadow-inner',
        className
      )}
      asChild={asChild}
      {...props}
    />
  );

  return isCollapsed && tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    button
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

// --------------------------------------------------
// Inset Layout Wrapper
// --------------------------------------------------
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed, isMobile } = useSidebar();

  if (isMobile)
    return <div ref={ref} className={cn('w-full', className)} {...props} />;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'ml-[72px]' : 'ml-[280px]',
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';

// --------------------------------------------------
// Mobile Toggle Button
// --------------------------------------------------
const SidebarTrigger = () => {
  const { isMobile, isCollapsed, setCollapsed } = useSidebar();
  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setCollapsed(!isCollapsed)}
    >
      <Menu />
    </Button>
  );
};

// --------------------------------------------------
// Exports
// --------------------------------------------------
export {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
};
