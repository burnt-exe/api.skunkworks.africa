import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./print.css";

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

// ────────────────────────────────────────────────
// ✅ Optimized font loading
// ────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// ────────────────────────────────────────────────
// ✅ Global SEO / PWA Metadata
// ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "EasyFile – Effortless Document Generation",
    template: "%s | EasyFile",
  },
  description:
    "Create professional invoices, purchase orders, receipts, and more with simplicity and precision using EasyFile.",
  applicationName: "EasyFile",
  authors: [{ name: "Skunkworks Africa", url: "https://skunkworks.africa" }],
  metadataBase: new URL("https://easyfile.skunkworks.africa"),
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "EasyFile – Effortless Document Generation",
    description:
      "Generate invoices, receipts, and business documents quickly and beautifully with EasyFile.",
    url: "https://easyfile.skunkworks.africa",
    siteName: "EasyFile",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "EasyFile Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyFile – Document Automation Made Simple",
    description: "Create, manage, and export business documents with ease.",
    creator: "@SkunkworksZA",
    images: ["/icon.png"],
  },
  keywords: [
    "EasyFile",
    "document automation",
    "invoice generator",
    "purchase order",
    "receipt maker",
    "Skunkworks Africa",
    "PDF export",
    "PWA document app",
  ],
  category: "business",
  alternates: {
    canonical: "https://easyfile.skunkworks.africa",
  },
};

// ────────────────────────────────────────────────
// ✅ PWA + Mobile Viewport Configuration
// ────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E1A" },
  ],
  viewportFit: "cover",
};

// ────────────────────────────────────────────────
// ✅ Root Layout Component
// ────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Progressive Web App (PWA) support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EasyFile" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="EasyFile" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body
        className={[
          inter.variable,
          spaceGrotesk.variable,
          "font-body antialiased bg-background text-foreground min-h-screen transition-colors duration-300",
        ].join(" ")}
      >
        {/* Firebase context provider */}
        <FirebaseClientProvider>
          {/* Global sidebar layout provider */}
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

          {/* Global toaster notifications */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
