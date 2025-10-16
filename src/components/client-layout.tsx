
'use client';

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { FirebaseClientProvider } from "@/firebase";
import ClientOnly from "@/components/client-only";
import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ClientLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-hidden">
              <ClientOnly>
                <Sidebar>
                  <SidebarNav />
                </Sidebar>
              </ClientOnly>
              
              <SidebarInset>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="flex flex-col flex-1 w-full h-full overflow-auto"
                >
                  <header className="flex items-center justify-end p-4 sm:hidden">
                    <SidebarTrigger />
                  </header>
                  <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                  </main>
                </motion.div>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
    )
}
