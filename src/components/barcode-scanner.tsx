
'use client';

import { useState, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useZxing } from 'react-zxing';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface BarcodeScannerProps {
  onResult: (result: string) => void;
}

export function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);

  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.getText());
    },
    onError(error) {
        if (!(error instanceof NotFoundException)) {
            console.error(error);
        }
    },
    timeBetweenDecodingAttempts: 300,
    paused: !hasCameraPermission,
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Permission granted
        setHasCameraPermission(true);
        // Stop all tracks to release the camera
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  }, []);


  return (
    <div className="space-y-4">
        <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
            <video ref={ref} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2/3 h-1/2 border-4 border-primary/50 rounded-lg shadow-lg" />
            </div>
        </div>

        {hasCameraPermission === false && (
            <Alert variant="destructive">
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                Please enable camera permissions in your browser settings to use the scanner.
                </AlertDescription>
            </Alert>
        )}
        {hasCameraPermission === undefined && (
             <Alert>
                <AlertTitle>Requesting Camera Access</AlertTitle>
                <AlertDescription>
                Please allow camera access to use the barcode scanner.
                </AlertDescription>
            </Alert>
        )}
    </div>
  );
}
