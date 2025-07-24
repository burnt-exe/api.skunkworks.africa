'use client';

import { usePathname } from 'next/navigation';
import { SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { FileText, Receipt, ShoppingCart, Users, Send, Briefcase } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Invoice', icon: FileText },
  { href: '/purchase-order', label: 'Purchase Order', icon: ShoppingCart },
  { href: '/sales-order', label: 'Sales Order', icon: Send },
  { href: '/receipt', label: 'Receipt', icon: Receipt },
  { href: '/payslip', label: 'Payslip', icon: Users },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className='flex flex-col h-full'>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary"/>
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">EasyDocs</h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-4">
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
