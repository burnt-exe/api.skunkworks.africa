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
    if (isUserLoading) {
      return; // Wait until user status is resolved
    }

    const isPublicPath = publicPaths.includes(pathname);

    // If user is not logged in and is on a protected page, redirect to login
    if (!user && !isPublicPath) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    // If user is logged in and on the login page, redirect to home
    if (user && isPublicPath) {
      router.push('/');
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
  
  // While redirecting, show nothing to prevent flashes of content
  if ((!user && !publicPaths.includes(pathname)) || (user && publicPaths.includes(pathname))) {
      return null;
  }

  return <>{children}</>;
}
