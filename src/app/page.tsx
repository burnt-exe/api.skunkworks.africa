
'use client';

import Link from 'next/link';
import { Briefcase, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Link href="/invoice">
            <div className="group inline-block p-8 bg-card rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer animate-pulse-slow">
              <Briefcase className="w-32 h-32 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
          </Link>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to EasyDocs
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your one-stop solution for generating professional documents with ease.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/invoice"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get Started
            </Link>
            <Link href="#" className="text-sm font-semibold leading-6 text-foreground">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
        <p>
          Developed by{' '}
          <span className="font-semibold text-foreground">SKUNKWORKS</span>
        </p>
        <div className="mt-2 space-x-4">
          <Link href="#" className="hover:text-foreground">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
