import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import './print.css';

import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { FirebaseClientProvider } from '@/firebase';
import ClientOnly from '@/components/client-only';
import React from 'react';

// ────────────────────────────────────────────────
// ✅ Optimized font loading
// ────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

// ────────────────────────────────────────────────
// ✅ Metadata for SEO, PWA & Social Sharing
// ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'EasyFile – Effortless Document Generation',
    template: '%s | EasyFile',
  },
  description:
    'Create professional invoices, purchase orders, receipts, and more with simplicity and precision using EasyFile.',
  applicationName: 'EasyFile',
  authors: [{ name: 'Skunkworks Africa', url: 'https://skunkworks.africa' }],
  metadataBase: new URL('https://easyfile.skunkworks.africa'),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'EasyFile – Effortless Document Generation',
    description:
      'Generate invoices, receipts, and business documents quickly and beautifully with EasyFile.',
    url: 'https://easyfile.skunkworks.africa',
    siteName: 'EasyFile',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'EasyFile Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyFile – Document Automation Made Simple',
    description: 'Create, manage, and export business documents with ease.',
    creator: '@SkunkworksZA',
    images: ['/icon.png'],
  },
  keywords: [
    'EasyFile',
    'document automation',
    'invoice generator',
    'purchase order',
    'receipt maker',
    'Skunkworks Africa',
    'PDF export',
    'PWA document app',
  ],
  category: 'business',
  alternates: {
    canonical: 'https://easyfile.skunkworks.africa',
  },
};

// ────────────────────────────────────────────────
// ✅ Viewport configuration for PWA + mobile
// ────────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E1A' },
  ],
  viewportFit: 'cover',
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
        {/* PWA iOS-specific meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EasyFile" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>

      <body
        className={`
          ${inter.variable}
          ${spaceGrotesk.variable}
          font-body
          antialiased
          bg-background
          text-foreground
          min-h-screen
          transition-colors
          duration-300
        `}
      >
        {/* Firebase Context Provider */}
        <FirebaseClientProvider>
          {/* Sidebar Layout Context */}
          <SidebarProvider>
            <div className="flex flex-col sm:flex-row min-h-screen w-full overflow-hidden">
              {/* Sidebar (only rendered client-side to prevent SSR mismatch) */}
              <ClientOnly>
                <div className="w-full sm:w-64 md:w-72 lg:w-80 border-r border-border bg-card/90 backdrop-blur-md">
                  <Sidebar>
                    <SidebarNav />
                  </Sidebar>
                </div>
              </ClientOnly>

              {/* Main content area */}
              <div className="flex-1 w-full bg-background/95 backdrop-blur-sm flex flex-col">
                <SidebarInset>
                  <main className="flex flex-col flex-1 w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
                    {children}
                  </main>
                </SidebarInset>
              </div>
            </div>
          </SidebarProvider>

          {/* Toast notifications (always client-side) */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
