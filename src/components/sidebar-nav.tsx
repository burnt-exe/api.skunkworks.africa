
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
  const { isIconMode, sidebarState } = useSidebar();
  const isOpen = sidebarState === 'full';

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
      className="flex flex-col h-full bg-[#0E0E1A] text-white/90 border-r border-white/10"
      role="navigation"
      aria-label="Primary Sidebar"
    >
      {/* Header */}
      <SidebarHeader className="p-3 justify-start">
        <Logo isCollapsed={!isOpen} />
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
                  'flex items-center w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-200 select-none',
                  'hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8EFF]',
                  isActive &&
                    'bg-gradient-to-r from-[#1D8EFF]/20 to-[#00B4FF]/20 text-white font-medium shadow-inner'
                )}
              >
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center gap-3"
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      'w-5 h-5 shrink-0 transition-transform duration-200',
                      isActive && 'scale-110 text-[#1D8EFF]'
                    )}
                  />
                  <span className={cn(isIconMode && "sr-only")}>
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
                'flex items-center w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-200 select-none',
                'hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8EFF]'
              )}
            >
              <Calculator
                aria-hidden="true"
                className='w-5 h-5 shrink-0 transition-transform duration-200'
              />
              <span className={cn(isIconMode && "sr-only")}>
                Calculator
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
      </SidebarMenu>

      {/* Footer */}
      <footer
        className={cn("p-4 text-xs text-white/40 border-t border-white/10 mt-auto", isIconMode && "p-2 text-center")}
        aria-label="Application version"
      >
        <span className={cn(isIconMode && "hidden")}>EasyFile Suite — </span>
        <span className="text-white/60">v1.0</span>
      </footer>
    </div>
  );
}
