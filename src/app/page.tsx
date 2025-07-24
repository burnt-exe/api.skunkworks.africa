
'use client';

import Link from 'next/link';
import { Briefcase, Zap, Wand, LoaderCircle } from 'lucide-react';
import { useState, useTransition } from 'react';
import { generateLandingPageImageAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const [backgroundImage, setBackgroundImage] = useState('https://placehold.co/1920x1080.png');
  const [prompt, setPrompt] = useState('a futuristic city skyline at sunset');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateImage = () => {
    startTransition(async () => {
      const result = await generateLandingPageImageAction({ prompt });
      if (result.success && result.data) {
        setBackgroundImage(result.data.imageUrl);
        toast({
          title: 'Success!',
          description: 'Your new background has been generated.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-1000 background-flow"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex flex-col min-h-screen bg-black/50">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="animate-pulse-slow">
              <Link href="/invoice" className="inline-block transform transition-transform duration-300 hover:scale-105">
                <div className="group rounded-full bg-white/20 p-6 shadow-2xl backdrop-blur-md">
                  <Briefcase className="h-24 w-24 text-white transition-transform duration-300 group-hover:scale-110" />
                </div>
              </Link>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
              Welcome to EasyDocs
            </h1>
            <p className="text-lg leading-8 text-white/90 drop-shadow-md">
              Your one-stop solution for generating professional documents with ease.
            </p>
             <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/invoice"
                className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get Started
              </Link>
              <Link href="#" className="text-sm font-semibold leading-6 text-white transition-opacity duration-300 hover:opacity-80">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
           <div className="absolute bottom-24 w-full max-w-lg p-4">
             <div className="relative rounded-lg border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
                <p className="mb-2 text-center text-sm text-white/80">Describe a scene to change the background!</p>
                <div className="flex gap-2">
                    <Input 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., a serene beach at sunrise"
                        className="border-white/30 bg-white/20 text-white placeholder:text-white/60 focus:ring-primary"
                    />
                    <Button onClick={handleGenerateImage} disabled={isPending} className="bg-primary hover:bg-primary/90">
                        {isPending ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <Wand />
                        )}
                    </Button>
                </div>
             </div>
          </div>
        </main>
        <footer className="bg-black/30 py-6 px-4 text-center text-sm text-white/70 backdrop-blur-sm sm:px-6 lg:px-8">
          <p>
            Developed by{' '}
            <span className="font-semibold text-white">SKUNKWORKS</span>
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
    </div>
  );
}
