'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Skeleton } from './ui/skeleton';

const publicPaths = ['/login'];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && !publicPaths.includes(pathname)) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading && !publicPaths.includes(pathname)) {
    return (
        <div className="flex flex-col min-h-screen p-8">
            <div className="flex items-center space-x-4 mb-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
            <Skeleton className="flex-grow w-full rounded-xl" />
        </div>
    );
  }
  
  if (!user && !publicPaths.includes(pathname)) {
      // Still loading or waiting for redirect
      return null;
  }
  
  // If user is logged in and on the login page, redirect to home
  if (user && pathname === '/login') {
      router.push('/');
      return null;
  }

  return <>{children}</>;
}
