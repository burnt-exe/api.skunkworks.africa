
'use client';

import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white">
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Link href="/invoice" className="inline-block mb-8">
             <div className="group rounded-full bg-white/10 p-6 shadow-2xl backdrop-blur-md transform transition-transform duration-300 hover:scale-105">
                <Briefcase className="h-24 w-24 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
          </Link>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
            Effortless Document Generation
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Welcome to EasyDocs. Your one-stop solution for creating professional invoices, purchase orders, receipts, and more with unparalleled ease.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/invoice">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full transition-transform duration-300 hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 text-center text-sm text-white/50">
        <p>
          Developed by <span className="font-semibold text-white/80">SKUNKWORKS</span>
        </p>
        <div className="mt-2 space-x-4">
          <Link href="#" className="transition-colors duration-300 hover:text-white">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link href="#" className="transition-colors duration-300 hover:text-white">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
