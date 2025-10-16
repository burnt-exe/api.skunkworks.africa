'use client';

import { Button } from '@/components/ui/button';
import React from 'react';

// --- Minimal working exports so imports stop breaking ---

export function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-64 min-h-screen bg-muted border-r border-border p-4">
      {children}
    </aside>
  );
}

export function SidebarTrigger() {
  return (
    <Button variant="outline" size="icon" className="rounded-full">
      ☰
    </Button>
  );
}

export function SidebarHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-2 font-semibold text-sm uppercase">{children}</div>;
}

export function SidebarMenu({ children }: { children?: React.ReactNode }) {
  return <nav className="flex flex-col space-y-1">{children}</nav>;
}

export function SidebarMenuItem({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({
  children,
  onClick,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button variant="ghost" className="w-full justify-start" onClick={onClick}>
      {children}
    </Button>
  );
}

export function SidebarInset({ children }: { children?: React.ReactNode }) {
  return <div className="flex-1">{children}</div>;
}

export function SidebarProvider({ children }: { children?: React.ReactNode }) {
  // placeholder context provider for compatibility
  return <>{children}</>;
}
