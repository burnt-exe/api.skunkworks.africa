'use client';

import React, { useState, useTransition } from 'react';
import NextDynamic from 'next/dynamic'; // ✅ renamed to avoid conflict
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  UploadCloud,
  LoaderCircle,
  Download,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { convertBankStatementAction } from '@/app/actions';

// ────────────────────────────────────────────────
// ✅ Lazy load pdf-parse and worker
// ────────────────────────────────────────────────
let pdf;
if (typeof window !== 'undefined') {
  import('pdf-parse/lib/pdf-parse')
    .then((mod) => {
      pdf = mod.default || mod;
      try {
        (window as any).pdfjsWorker = import('pdfjs-dist/build/pdf.worker.mjs');
      } catch {
        console.warn('PDF.js worker could not be initialized.');
      }
    })
    .catch((err) => console.error('Failed to load pdf-parse:', err));
}

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────
// ✅ Component
// ────────────────────────────────────────────────
export default function BankStatementConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, startTransition] = useTransition();
  const [convertedCsv, setConvertedCsv] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a valid PDF file.',
      });
      setFile(null);
      return;
    }
    setFile(selected);
    setConvertedCsv(null);
    toast({ title: 'File Selected', description: selected.name });
  };

  const handleConvert = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Choose a PDF to convert.',
      });
      return;
    }

    startTransition(async () => {
      try {
        if (!pdf) throw new Error('PDF parser not initialized. Refresh and retry.');
        const buf = await file.arrayBuffer();
        const data = await pdf(buf);
        const text = data.text.trim();
        if (!text) throw new Error('No readable text detected in the PDF.');

        const result = await convertBankStatementAction({ textContent: text });
        if (!result.success) throw new Error(result.error);

        setConvertedCsv(result.data?.csvContent || '');
        toast({
          title: 'Conversion Complete',
          description: 'Your CSV file is ready.',
        });
      } catch (err) {
        toast({
          title: 'Conversion Failed',
          description:
            err instanceof Error ? err.message : 'Unexpected error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDownload = () => {
    if (!convertedCsv || !file) return;
    const blob = new Blob([convertedCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.pdf$/i, '')}-sage-import.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Download Started', description: 'Your CSV is downloading.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bank Statement to CSV Converter</h1>
        <p className="text-muted-foreground">
          Upload a PDF bank statement to convert it into a Sage-compatible CSV.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Statement</CardTitle>
          <CardDescription>
            The AI will extract transactions automatically. Review before import.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">PDF Bank Statement</Label>
            <div className="flex items-center gap-4">
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="pdf-upload"
                className="flex-1 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-8 w-8" />
                    <p>Click or drag your PDF here</p>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={isConverting || !file}
            className="w-full"
          >
            {isConverting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to CSV'
            )}
          </Button>

          {convertedCsv && (
            <Card className="bg-muted/50 border-green-500/40">
              <CardContent className="p-4 flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="font-medium">Conversion Complete!</p>
                <Button onClick={handleDownload} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
