
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import './print.css';

import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { FirebaseClientProvider } from '@/firebase';
import ClientOnly from '@/components/client-only';

// Load fonts via Next.js font optimization (faster + preloaded)
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


export const metadata: Metadata = {
  title: 'EasyFile – Effortless Document Generation',
  description:
    'Create professional invoices, purchase orders, receipts, and more with simplicity and precision using EasyFile.',
  metadataBase: new URL('https://easyfile.skunkworks.africa'), // ✅ helps with canonical + OG URLs
  manifest: '/manifest.json',
  openGraph: {
    title: 'EasyFile – Effortless Document Generation',
    description:
      'Your one-stop solution for generating invoices, receipts, and business documents quickly and beautifully.',
    url: 'https://easyfile.skunkworks.africa',
    siteName: 'EasyFile',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyFile – Document Automation Made Simple',
    description:
      'Create, manage, and export business documents with ease.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased bg-background text-foreground min-h-screen`}
      >
        {/* Client-side Firebase context */}
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              {/* Sidebar rendered client-side only to avoid SSR mismatch */}
              <ClientOnly>
                <Sidebar>
                  <SidebarNav />
                </Sidebar>
              </ClientOnly>

              <SidebarInset>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>

          {/* Toast notifications always client-side */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
