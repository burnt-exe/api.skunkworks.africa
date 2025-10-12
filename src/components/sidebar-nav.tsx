
'use client';

import { usePathname } from 'next/navigation';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { FileText, Receipt, ShoppingCart, Users, Send, FileSignature, Package, Home, Banknote, Calculator } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const navItems = [
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
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className='flex flex-col h-full text-sidebar-foreground'>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" alt="EasyFile Logo" width={32} height={32} />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">EasyFile</h1>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-grow p-4">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
