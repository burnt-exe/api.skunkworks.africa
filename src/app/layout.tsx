
'use client';

import type { Metadata } from 'next';
import './globals.css';
import './print.css';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { usePathname } from 'next/navigation';

/*
export const metadata: Metadata = {
  title: 'EasyDocs',
  description: 'Generate POs, Invoices, and more with ease.',
};
*/

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
        <ConditionalSidebar>{children}</ConditionalSidebar>
        <Toaster />
      </body>
    </html>
  );
}

function ConditionalSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // We are rendering the sidebar conditionally based on the path.
  // The landing page ('/') will not have a sidebar, but all other pages will.
  if (pathname === '/') {
    return <main>{children}</main>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
