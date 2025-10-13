'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Listens for Firestore "permission-error" events and rethrows them
 * so they are caught by Next.js's global-error.tsx boundary.
 *
 * This component should be mounted near the root of the client tree
 * (e.g., inside <FirebaseClientProvider> or <Providers />).
 */
export function FirebaseErrorListener(): null {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // Define a stable event callback.
    const handleError = (err: FirestorePermissionError) => {
      // Log for visibility (useful during debugging).
      if (process.env.NODE_ENV !== 'production') {
        console.error('[FirebaseErrorListener] Permission error caught:', err);
      }
      setError(err);
    };

    // Subscribe to global error events.
    errorEmitter.on('permission-error', handleError);

    // Clean up subscription on unmount.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // When error is set, throw to Next.js's global error boundary.
  if (error) throw error;

  // This component intentionally renders nothing.
  return null;
}
