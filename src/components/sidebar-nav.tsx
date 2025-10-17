'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Calculator,
  FileCog,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalculator } from '@/context/CalculatorProvider';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { EasyFileLogo } from '@/components/logo';

/**
 * Sidebar navigation for EasyFile Suite.
 * Renders collapsible icons, tooltips, and active states with gradient highlights.
 */
export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCalculator } = useCalculator();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

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
      { href: '/easy-docu-convert', label: 'EasyDocuConvert', icon: FileCog },
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
            <EasyFileLogo
              className="object-contain drop-shadow-[0_0_6px_rgba(56,152,255,0.6)] group-hover:scale-110 transition-transform duration-300 ease-in-out"
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
         <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleCalculator}
              tooltip="Calculator"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 select-none',
                'hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8EFF]'
              )}
            >
              <Calculator
                aria-hidden="true"
                className='w-5 h-5 shrink-0 transition-transform duration-200'
              />
              <span className="group-data-[collapsible=icon]:hidden">
                Calculator
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
      </SidebarMenu>

      {/* User Footer */}
      <footer
        className="p-2 border-t border-white/10 group-data-[collapsible=icon]:p-2"
        aria-label="User account management"
      >
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="w-full justify-start h-auto p-2">
                    <div className="flex items-center gap-3">
                         <Avatar className="w-8 h-8 border-2 border-primary/50">
                            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'}/>
                            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-left group-data-[collapsible=icon]:hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.displayName || user?.email}</p>
                            <p className="text-xs text-white/50">View Account</p>
                        </div>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={12}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </nav>
  );
}
