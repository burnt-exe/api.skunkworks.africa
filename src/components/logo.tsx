
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';

interface LogoProps extends React.HTMLAttributes<HTMLAnchorElement> {
  isCollapsed: boolean;
}

export function Logo({ isCollapsed, className, ...props }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md',
        className
      )}
      {...props}
    >
      <div className="relative w-9 h-9">
        <Image
          src="/icon.png"
          alt="EasyFile Logo"
          width={36}
          height={36}
          priority
          className="object-contain drop-shadow-[0_0_6px_rgba(56,152,255,0.6)] group-hover:scale-110 transition-transform duration-300 ease-in-out"
        />
      </div>
      <h1
        className={cn(
          'text-lg font-semibold tracking-tight whitespace-nowrap transition-opacity duration-200',
          'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent',
          isCollapsed && 'opacity-0 w-0'
        )}
      >
        EasyFile
      </h1>
    </Link>
  );
}
