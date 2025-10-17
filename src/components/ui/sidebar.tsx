
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
type SidebarState = 'full' | 'compact' | 'hidden';

type SidebarContextType = {
  sidebarState: SidebarState;
  isMobile: boolean | undefined;
  isIconMode: boolean;
  toggleSidebar: () => void;
  setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

export const useSidebar = () => {
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
  const [sidebarState, setSidebarState] = React.useState<SidebarState>('full');
  const isMobile = useIsMobile();
  const isIconMode = sidebarState === 'compact';

  React.useEffect(() => {
    if (isMobile) {
      setSidebarState('hidden');
    } else {
      setSidebarState('full');
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarState((prev) => {
        if (isMobile) {
            return prev === 'hidden' ? 'full' : 'hidden';
        }
        // Desktop cycle: full -> compact -> hidden -> full
        if (prev === 'full') return 'compact';
        if (prev === 'compact') return 'hidden';
        return 'full';
    });
  };

  const value = { sidebarState, isMobile, isIconMode, toggleSidebar, setSidebarState };

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div className="flex min-h-screen w-full overflow-hidden">
            {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Sidebar                                  */
/* -------------------------------------------------------------------------- */
export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();
  const Comp = isMobile ? MobileSidebar : DesktopSidebar;
  return <Comp>{children}</Comp>;
}

/* -------------------------------------------------------------------------- */
/*                               Mobile Sidebar                               */
/* -------------------------------------------------------------------------- */
function MobileSidebar({ children }: { children: React.ReactNode }) {
  const { sidebarState, setSidebarState } = useSidebar();
  const isOpen = sidebarState === 'full';

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarState('hidden');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setSidebarState]);

  return (
    <>
      <header className="flex items-center justify-end p-4 sm:hidden">
          <SidebarTrigger />
      </header>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarState('hidden')} />
            <motion.aside
              className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-background group"
              data-collapsible="full"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ ease: 'easeInOut', duration: 0.3 }}
            >
              {children}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Desktop Sidebar                               */
/* -------------------------------------------------------------------------- */
function DesktopSidebar({ children }: { children: React.ReactNode }) {
  const { sidebarState } = useSidebar();
  
  const sidebarVariants = {
    full: {
      width: 'auto',
      maxWidth: '256px',
      minWidth: '200px', // Ensure it doesn't get too small
      transition: { ease: 'easeInOut', duration: 0.3 },
    },
    compact: {
      width: '64px',
      transition: { ease: 'easeInOut', duration: 0.3 },
    },
    hidden: {
      width: '0px',
      minWidth: '0px',
      transition: { ease: 'easeInOut', duration: 0.3 },
    },
  };

  return (
    <motion.aside
      className={cn('h-screen overflow-y-auto overflow-x-hidden group z-30')}
      initial={false}
      animate={sidebarState}
      variants={sidebarVariants}
      data-collapsible={sidebarState}
    >
      {children}
    </motion.aside>
  );
}


/* -------------------------------------------------------------------------- */
/*                               Sidebar Trigger                              */
/* -------------------------------------------------------------------------- */
export function SidebarTrigger() {
  const { toggleSidebar, sidebarState, isMobile } = useSidebar();
  const isOpen = sidebarState === 'full';

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
          key={isOpen && isMobile ? 'open' : 'closed'}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen && isMobile ? <X /> : <Menu />}
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
      'flex h-16 shrink-0 items-center',
      'transition-all duration-300 ease-in-out',
      'group-data-[collapsible=compact]:justify-center group-data-[collapsible=compact]:px-2',
      'group-data-[collapsible=full]:justify-start group-data-[collapsible=full]:px-4',
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
    className={cn(
        'flex flex-col flex-1 space-y-1 overflow-y-auto px-2 py-4',
        'transition-all duration-300 ease-in-out',
        'group-data-[collapsible=compact]:px-2',
        'group-data-[collapsible=full]:px-4',
        className
    )}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


export const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button> & { isActive?: boolean; tooltip?: string }
>(({ asChild, isActive, tooltip, children, ...props }, ref) => {
  const { isIconMode } = useSidebar();

  const buttonContent = (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'w-full justify-start h-auto p-3',
        isIconMode && 'justify-center',
        isActive && 'bg-accent text-accent-foreground',
        props.className
      )}
      {...props}
      asChild={asChild}
    >
        {children}
    </Button>
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
