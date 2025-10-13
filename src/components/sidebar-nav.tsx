
'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  Banknote,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Sidebar navigation for EasyFile Suite.
 * Renders collapsible icons, tooltips, and active states with gradient highlights.
 */
export function SidebarNav() {
  const pathname = usePathname();
  const [logoSrc, setLogoSrc] = useState('/icon.png');

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home', icon: Home },
      { href: '/invoice', label: 'Invoice', icon: FileText },
      { href: '/easy-quote', label: 'EasyQuote', icon: FileSignature },
      { href: '/purchase-order', label: 'Purchase Order', icon: ShoppingCart },
      { href: '/sales-order', label: 'Sales Order', icon: Send },
      { href: '/receipt', label: 'Receipt', icon: Receipt },
      { href: '/payslip', label: 'Payslip', icon: Users },
      { href: '/easy-stock-inventory', label: 'EasyStock Inventory', icon: Package },
      { href: '/bank-statement-converter', label: 'Bank Statement Converter', icon: Banknote },
      { href: '/calculator', label: 'Calculator', icon: Calculator },
    ],
    []
  );

  return (
    <nav
      className="flex flex-col h-full bg-[#0E0E1A] text-white/90 border-r border-white/10"
      role="navigation"
      aria-label="Primary Sidebar"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8EFF] rounded-md"
        >
          <div className="relative w-9 h-9">
            <Image
              src={logoSrc}
              alt="EasyFile Logo"
              width={36}
              height={36}
              priority
              className="object-contain drop-shadow-[0_0_6px_rgba(56,152,255,0.6)] group-hover:scale-110 transition-transform duration-300 ease-in-out"
              onError={() => setLogoSrc('/icon.svg')}
            />
          </div>
          <h1 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-[#1D8EFF] to-[#00B4FF] bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
            EasyFile
          </h1>
        </Link>
      </SidebarHeader>

      {/* Navigation Items */}
      <SidebarMenu className="flex-grow p-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={label}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 select-none',
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
                  <span className="group-data-[collapsible=icon]:hidden">
                    {label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      {/* Footer */}
      <footer
        className="p-4 text-xs text-white/40 border-t border-white/10"
        aria-label="Application version"
      >
        EasyFile Suite — <span className="text-white/60">v1.0</span>
      </footer>
    </nav>
  );
}
