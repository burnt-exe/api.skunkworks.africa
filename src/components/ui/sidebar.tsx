'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './button';
import { Menu, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */
type SidebarContextType = {
  isOpen: boolean;
  isMobile: boolean | undefined;
  isIconMode: boolean;
  toggleSidebar: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

/* -------------------------------------------------------------------------- */
/*                                  Provider                                  */
/* -------------------------------------------------------------------------- */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  const isMobile = useIsMobile();
  const isIconMode = isMobile === false && isOpen === false;

  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{ isOpen, isMobile, isIconMode, toggleSidebar, setIsOpen }}
    >
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Sidebar                                  */
/* -------------------------------------------------------------------------- */
export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();
  const Comp = isMobile ? MobileSidebar : DesktopSidebar;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isOpen && <Comp>{children}</Comp>}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Mobile Sidebar                               */
/* -------------------------------------------------------------------------- */
function MobileSidebar({ children }: { children: React.ReactNode }) {
  const { setIsOpen } = useSidebar();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setIsOpen]);

  return (
    <motion.div
      className="fixed inset-0 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <motion.div
        className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-background"
        initial={{ x: '-100%' }}
        animate={{ x: '0%' }}
        exit={{ x: '-100%' }}
        transition={{ ease: 'easeInOut', duration: 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Desktop Sidebar                               */
/* -------------------------------------------------------------------------- */
function DesktopSidebar({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  return (
    <motion.aside
      className={cn('h-screen overflow-y-auto overflow-x-hidden group transition-[width] duration-300 ease-in-out')}
      initial={{ width: isOpen ? 'var(--sidebar-open-width)' : 'var(--sidebar-closed-width)' }}
      animate={{ width: isOpen ? 'var(--sidebar-open-width)' : 'var(--sidebar-closed-width)' }}
      transition={{ ease: 'easeInOut', duration: 0.3 }}
      style={{
        '--sidebar-open-width': '256px',
        '--sidebar-closed-width': '64px',
      } as React.CSSProperties}
      data-collapsible={isOpen ? 'full' : 'icon'}
    >
      {children}
    </motion.aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Sidebar Trigger                              */
/* -------------------------------------------------------------------------- */
export function SidebarTrigger() {
  const { toggleSidebar, isOpen } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="rounded-full"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isOpen ? 'open' : 'closed'}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X /> : <Menu />}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Sidebar Components                             */
/* -------------------------------------------------------------------------- */
export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-16 shrink-0 items-center justify-between px-4',
      className
    )}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarMenu = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn('flex-1 space-y-1 overflow-y-auto px-2 py-4', className)}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  const { isIconMode } = useSidebar();
  if (isIconMode) {
    return <>{children}</>;
  }
  return <>{children}</>;
}

export const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button> & { isActive?: boolean; tooltip?: string }
>(({ asChild, isActive, tooltip, ...props }, ref) => {
  const { isIconMode } = useSidebar();

  const buttonContent = (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'w-full justify-start',
        isIconMode && 'justify-center',
        isActive && 'bg-accent'
      )}
      {...props}
      asChild={asChild}
    />
  );

  if (isIconMode) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex h-full flex-col', className)}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';
