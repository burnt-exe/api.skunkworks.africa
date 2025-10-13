'use client';

import { useEffect, useState, memo } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  /**
   * Optional fallback element to render on the server (before hydration).
   * Useful for showing loading placeholders or avoiding layout shifts.
   */
  fallback?: React.ReactNode;
}

/**
 * ClientOnly
 * --------------------------------------------------------------------------
 * Ensures children render **only** after the component mounts on the client.
 * Prevents hydration mismatches for components using browser-only APIs
 * (e.g., `window`, `localStorage`, `matchMedia`, etc.).
 *
 * Example:
 *   <ClientOnly fallback={<Spinner />}>
 *     <DynamicMap />
 *   </ClientOnly>
 */
function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;

  return <>{children}</>;
}

export default memo(ClientOnly);
