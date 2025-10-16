'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-8">
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-transparent">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="EasyFile Logo" width={32} height={32} style={{ height: 'auto' }} />
          <h1 className="text-xl font-semibold">EasyFile</h1>
        </Link>
        <SidebarTrigger />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Link href="/invoice" className="inline-block mb-6 md:mb-8">
            <div className="group rounded-full bg-primary/10 p-4 md:p-6 shadow-2xl backdrop-blur-md transform transition-transform duration-300 hover:scale-105">
              <Image
                src="/logo.png"
                alt="EasyFile Logo"
                width={96}
                height={96}
                priority
                className="transition-transform duration-300 group-hover:scale-110"
                style={{ height: 'auto' }}
              />
            </div>
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Effortless Document Generation
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-lg md:max-w-2xl mx-auto mb-6 md:mb-8">
            Welcome to EasyFile. Your one-stop solution for creating professional invoices, purchase orders, receipts, and more with unparalleled ease.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/invoice">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base md:text-lg px-6 py-4 md:px-8 md:py-6 rounded-full transition-transform duration-300 hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 text-center text-xs sm:text-sm text-muted-foreground">
        <p>
          Copyright &copy; 2024{' '}
          <a
            href="https://easyfile.skunkworks.africa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground/80 hover:underline"
          >
            easyfile.skunkworks.africa
          </a>
        </p>
        <div className="mt-2 space-x-2 sm:space-x-4">
          <Link
            href="https://easyfile.skunkworks.africa/terms"
            className="transition-colors duration-300 hover:text-foreground"
          >
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link
            href="https://easyfile.skunkworks.africa/privacy"
            className="transition-colors duration-300 hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
