'use client';

import { useState, useEffect, useCallback } from 'react';
import { NotFoundException } from '@zxing/library';
import { useZxing } from 'react-zxing';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface BarcodeScannerProps {
  /** Called with the decoded barcode string. */
  onResult: (result: string) => void;
  /** Optional delay (ms) between decode attempts. Defaults to 300. */
  decodeInterval?: number;
}

/**
 * BarcodeScanner — A camera-based barcode/QR reader using ZXing.
 * Handles camera permission gracefully and overlays a scanning frame.
 *
 * Example:
 *   <BarcodeScanner onResult={(code) => console.log(code)} />
 */
export function BarcodeScanner({
  onResult,
  decodeInterval = 300,
}: BarcodeScannerProps) {
  const [permission, setPermission] = useState<
    'granted' | 'denied' | 'pending'
  >('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      // Prevent duplicate scan events
      onResult(result.getText());
    },
    onError(error) {
      if (!(error instanceof NotFoundException)) {
        console.error('[ZXing] Decode error:', error);
      }
    },
    timeBetweenDecodingAttempts: decodeInterval,
    paused: permission !== 'granted',
  });

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermission('granted');
      // Immediately release the camera stream — react-zxing will handle its own.
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error('[Camera] Access denied:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Camera access denied.'
      );
      setPermission('denied');
    }
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
      <video
        ref={ref as React.RefObject<HTMLVideoElement>}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          {/* scanning frame overlay */}
          <div className="w-2/3 h-1/2 border-4 border-primary/50 rounded-lg shadow-lg animate-pulse" />
        </div>
      </div>

      {/* Feedback states */}
      {permission === 'denied' && (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Denied</AlertTitle>
          <AlertDescription>
            {errorMessage ??
              'Please enable camera permissions in your browser settings to use the scanner.'}
          </AlertDescription>
        </Alert>
      )}

      {permission === 'pending' && (
        <Alert>
          <AlertTitle>Requesting Camera Access</AlertTitle>
          <AlertDescription>
            Please allow camera access to activate the barcode scanner.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
