'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground -m-4 sm:-m-6 lg:-m-8">
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
            <Image src="/studio/icon.svg" alt="EasyFile Logo" width={32} height={32} />
            <h1 className="text-xl font-semibold">EasyFile</h1>
        </Link>
        <SidebarTrigger />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
             <Image 
                src="/studio/icon.svg"
                alt="EasyFile App Icon"
                width={128}
                height={128}
                className="mx-auto rounded-3xl shadow-2xl"
                priority
              />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
            Effortless Document Generation
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Welcome to EasyFile. Your one-stop solution for creating professional invoices, purchase orders, receipts, and more with unparalleled ease.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/invoice">
              <Button size="lg" className="font-semibold text-lg px-8 py-6 rounded-full transition-transform duration-300 hover:scale-105 shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 text-center text-xs sm:text-sm text-muted-foreground">
        <p>
          Copyright &copy; 2024 <a href="https://easyfile.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">easyfile.co.za</a>
        </p>
        <div className="mt-2 space-x-2 sm:space-x-4">
          <Link href="#" className="transition-colors duration-300 hover:text-foreground">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link href="#" className="transition-colors duration-300 hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
