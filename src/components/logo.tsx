
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import logoSrc from '/icon.png';

interface LogoProps extends React.HTMLAttributes<HTMLAnchorElement> {
  isCollapsed: boolean;
}

export function Logo({ isCollapsed, className, ...props }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D8EFF] rounded-md',
        className
      )}
      {...props}
    >
      <div className="relative w-9 h-9">
        <Image
          src={logoSrc}
          alt="EasyFile Logo"
          width={36}
          height={36}
          priority
          className="object-contain drop-shadow-[0_0_6px_rgba(56,152,255,0.6)] group-hover:scale-110 transition-transform duration-300 ease-in-out"
        />
      </div>
      <h1
        className={cn(
          'text-lg font-semibold tracking-tight bg-gradient-to-r from-[#1D8EFF] to-[#00B4FF] bg-clip-text text-transparent',
          isCollapsed && 'hidden'
        )}
      >
        EasyFile
      </h1>
    </Link>
  );
}
