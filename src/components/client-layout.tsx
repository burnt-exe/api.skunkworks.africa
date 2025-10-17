
'use client';

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import {
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { FirebaseClientProvider } from "@/firebase";
import { CalculatorProvider } from "@/context/CalculatorProvider";
import { CalculatorDialog } from "./calculator";
import { AuthGuard } from "./auth-guard";

export default function ClientLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <FirebaseClientProvider>
          <CalculatorProvider>
            <SidebarProvider>
              <AuthGuard>
                <Sidebar>
                  <SidebarNav />
                </Sidebar>
                <main className="flex-1 h-full overflow-auto">
                    {children}
                </main>
                <CalculatorDialog />
              </AuthGuard>
            </SidebarProvider>
            <Toaster />
          </CalculatorProvider>
        </FirebaseClientProvider>
    )
}
