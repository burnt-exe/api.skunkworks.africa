
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';
import { generateLandingPageImageAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateImage = async () => {
      setIsLoading(true);
      const result = await generateLandingPageImageAction({ 
        prompt: "A stunning, photorealistic, high-resolution hero image for a modern software-as-a-service application. The image should convey themes of efficiency, professionalism, and document management. A clean and bright office environment with subtle elements like organized paperwork, a sleek laptop, and a person focused on their work. The color palette should be professional, with blues, whites, and greys, and a touch of a vibrant accent color. The composition should be artistic and visually appealing, suitable for a website background." 
      });
      if (result.success && result.data?.imageUrl) {
        setBackgroundImage(result.data.imageUrl);
      } else {
        // Fallback in case of error
        console.error("Failed to generate image:", result.error);
        setBackgroundImage('https://picsum.photos/seed/landing/1920/1080');
      }
      setIsLoading(false);
    };
    generateImage();
  }, []);

  return (
     <div className="relative flex flex-col min-h-screen text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {backgroundImage ? (
              <Image
                src={backgroundImage}
                alt="AI generated background of a modern office"
                fill
                quality={100}
                className="object-cover"
                data-ai-hint="modern office"
              />
          ) : (
            <div className="w-full h-full bg-gray-900" />
          )}
           {/* Overlay */}
           <div className={cn(
               "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-1000",
               isLoading ? "opacity-100" : "opacity-50"
           )} />
        </div>

      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-transparent">
        <Link href="/" className="flex items-center gap-2">
            <Image src="/studio/icon.svg" alt="EasyFile Logo" width={32} height={32} />
            <h1 className="text-xl font-semibold [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]">EasyFile</h1>
        </Link>
        <SidebarTrigger className="text-white hover:bg-white/10 active:bg-white/20 [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]"/>
      </header>
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
              <LoaderCircle className="h-12 w-12 animate-spin text-white/80" />
              <p className="text-white/70">Generating a stunning background for you...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in-5 duration-1000">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-4 [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">
              Effortless Document Generation
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]">
              Welcome to EasyFile. Your one-stop solution for creating professional invoices, purchase orders, receipts, and more with unparalleled ease.
            </p>

            <div className="flex justify-center gap-4">
              <Link href="/invoice">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full transition-transform duration-300 hover:scale-105 shadow-2xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-6 px-4 text-center text-xs sm:text-sm text-white/60">
        <p>
          Copyright &copy; 2024 <a href="https://easyfile.co.za" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/80 hover:underline">easyfile.co.za</a>
        </p>
        <div className="mt-2 space-x-2 sm:space-x-4">
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
