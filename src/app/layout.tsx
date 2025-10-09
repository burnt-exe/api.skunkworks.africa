
import type { Metadata } from 'next';
import './globals.css';
import './print.css';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { FirebaseClientProvider } from '@/firebase';
import ClientOnly from '@/components/client-only';

export const metadata: Metadata = {
  title: 'EasyFile - Effortless Document Generation',
  description: 'Your one-stop solution for creating professional invoices, purchase orders, receipts, and more with unparalleled ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex">
              <ClientOnly>
                <Sidebar collapsible="icon">
                  <SidebarNav />
                </Sidebar>
                <SidebarInset>
                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </SidebarInset>
              </ClientOnly>
            </div>
          </SidebarProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
