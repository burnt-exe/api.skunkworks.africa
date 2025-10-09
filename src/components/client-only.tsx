
'use client';

import { useEffect, useState } from 'react';

/**
 * A component that only renders its children on the client-side after mounting.
 * This is useful to prevent hydration mismatch errors when a component relies on
 * browser-specific APIs (like window) that are not available on the server.
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
