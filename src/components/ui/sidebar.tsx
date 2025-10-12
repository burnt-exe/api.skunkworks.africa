
'use client';

import * as React from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SidebarNav } from '../sidebar-nav';

type SidebarContextProps = {
  isCollapsed: boolean;
  isMobile: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setCollapsed] = React.useState(isMobile ?? false ? true : defaultCollapsed);

  React.useEffect(() => {
    setCollapsed(isMobile ?? false ? true : defaultCollapsed);
  }, [isMobile, defaultCollapsed]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobile: isMobile ?? false, setCollapsed }}>
        <TooltipProvider delayDuration={0}>
            {children}
        </TooltipProvider>
    </SidebarContext.Provider>
  );
}

type CollapsibleOption = 'icon' | 'responsive';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: CollapsibleOption;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, collapsible = 'responsive', ...props }, ref) => {
    const { isCollapsed, isMobile, setCollapsed } = useSidebar();
    
    const effectiveCollapsible = isMobile ? 'icon' : collapsible;

    const handleToggle = () => {
        setCollapsed(!isCollapsed);
    }
    
    if (isMobile) {
        return (
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px]">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarNav />
                </SheetContent>
            </Sheet>
        )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'h-screen sticky top-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-[72px]' : 'w-[280px]',
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
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 rounded-full bg-background border"
              onClick={handleToggle}
            >
              <ChevronLeft className={cn('transition-transform', isCollapsed && 'rotate-180')} />
            </Button>
          )}
        </div>
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('group-data-[collapsible=icon]:justify-center', className)}
        {...props}
      />
    );
  }
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex-grow', className)} {...props} />;
  }
);
SidebarMenu.displayName = 'SidebarMenu';


const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return <div ref={ref} className={cn(className)} {...props} />;
    }
);
SidebarMenuItem.displayName = 'SidebarMenuItem';


interface SidebarMenuButtonProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, asChild, isActive, tooltip, ...props }, ref) => {
    const { isCollapsed } = useSidebar();

    const buttonContent = <Button ref={ref} variant="ghost" size={isCollapsed ? "icon" : "default"} className={cn('w-full justify-start', isActive && 'bg-accent', className)} asChild={asChild} {...props} />;

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return buttonContent;
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed, isMobile } = useSidebar();
    
    if (isMobile) {
        return <div ref={ref} className={cn('w-full', className)} {...props} />;
    }

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
  }
);
SidebarInset.displayName = 'SidebarInset';

const SidebarTrigger = () => {
    const { isMobile, isCollapsed, setCollapsed } = useSidebar();

    if (!isMobile) return null;

    return (
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!isCollapsed)}>
            <Menu />
        </Button>
    )
}


export {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
};
