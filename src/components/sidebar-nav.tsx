
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from './ui/sidebar';
import {
  FileText,
  Receipt,
  ShoppingCart,
  Users,
  Send,
  FileSignature,
  Package,
  Home,
  Calculator,
  FileCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalculator } from '@/context/CalculatorProvider';
import { Logo } from './logo';

/**
 * Sidebar navigation for EasyFile Suite.
 * Renders collapsible icons, tooltips, and active states with gradient highlights.
 */
export function SidebarNav() {
  const pathname = usePathname();
  const { toggleCalculator } = useCalculator();
  const { isIconMode } = useSidebar();

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home', icon: Home },
      { href: '/invoice', label: 'EasyInvoice', icon: FileText },
      { href: '/easy-quote', label: 'EasyQuote', icon: FileSignature },
      { href: '/purchase-order', label: 'EasyPO', icon: ShoppingCart },
      { href: '/sales-order', label: 'EasySO', icon: Send },
      { href: '/receipt', label: 'EasyReceipt', icon: Receipt },
      { href: '/payslip', label: 'EasyPayslip', icon: Users },
      { href: '/easy-stock-inventory', label: 'EasyStock', icon: Package },
      { href: '/easy-docu-convert', label: 'EasyConvert', icon: FileCog },
      { href: '/easy-contract', label: 'EasyContract', icon: FileSignature },
    ],
    []
  );

  return (
    <div
      className="flex flex-col h-full bg-background text-foreground/90 border-r border-border/10"
      role="navigation"
      aria-label="Primary Sidebar"
    >
      {/* Header */}
      <SidebarHeader>
        <Logo isCollapsed={isIconMode} />
      </SidebarHeader>

      {/* Navigation Items */}
      <SidebarMenu>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={label}
                className={cn(
                  'transition-all duration-200 select-none',
                  'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive &&
                    'bg-primary/10 text-primary font-medium'
                )}
              >
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      'w-5 h-5 shrink-0 transition-transform duration-200',
                      isActive && 'scale-110 text-primary'
                    )}
                  />
                  <span className={cn('whitespace-nowrap transition-opacity duration-200', isIconMode ? 'opacity-0 w-0' : 'opacity-100 w-auto')}>
                    {label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
         <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleCalculator}
              tooltip="Calculator"
              className={cn(
                'transition-all duration-200 select-none',
                'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <>
                <Calculator
                  aria-hidden="true"
                  className='w-5 h-5 shrink-0 transition-transform duration-200'
                />
                <span className={cn('whitespace-nowrap transition-opacity duration-200', isIconMode ? 'opacity-0 w-0' : 'opacity-100 w-auto')}>
                  Calculator
                </span>
              </>
            </SidebarMenuButton>
          </SidebarMenuItem>
      </SidebarMenu>

      {/* Footer */}
      <footer
        className={cn(
          "px-4 py-3 text-xs text-muted-foreground border-t border-border/10 mt-auto transition-all duration-300",
          isIconMode && "px-2 text-center"
        )}
        aria-label="Application version"
      >
        <span className={cn(isIconMode && "hidden")}>EasyFile Suite — </span>
        <span className="text-foreground/60">v1.0</span>
      </footer>
    </div>
  );
}
