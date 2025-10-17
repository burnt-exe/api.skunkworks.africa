
'use client';

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { FirebaseClientProvider } from "@/firebase";
import ClientOnly from "@/components/client-only";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CalculatorProvider, useCalculator } from "@/context/CalculatorProvider";
import { CalculatorDialog } from "./calculator";
import { AuthGuard } from "./auth-guard";

function AppContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();

  const sidebarWidth = isMobile ? 0 : isOpen ? 256 : 64;

  return (
      <div className="flex min-h-screen w-full overflow-hidden">
        <ClientOnly>
          <Sidebar>
            <SidebarNav />
          </Sidebar>
        </ClientOnly>
        
        <motion.div
          className="flex flex-col flex-1 h-full overflow-auto"
          animate={{ marginLeft: sidebarWidth }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <header className="flex items-center justify-end p-4 sm:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </motion.div>
      </div>
  )
}

export default function ClientLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <FirebaseClientProvider>
          <CalculatorProvider>
            <AuthGuard>
              <SidebarProvider>
                <AppContent>{children}</AppContent>
                <CalculatorDialog />
              </SidebarProvider>
            </AuthGuard>
            <Toaster />
          </CalculatorProvider>
        </FirebaseClientProvider>
    )
}
