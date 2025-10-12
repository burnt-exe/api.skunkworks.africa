'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, LoaderCircle, Download, FileText, CheckCircle } from 'lucide-react';
import { convertBankStatementAction } from '@/app/actions';
import pdf from 'pdf-parse/lib/pdf-parse';

// The pdf-parse library requires a global variable to be set for its worker.
// This is a workaround for Next.js environments.
if (typeof window !== 'undefined') {
  (window as any).pdfjsWorker = import('pdfjs-dist/build/pdf.worker.min.mjs');
}

export default function BankStatementConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, startTransition] = useTransition();
  const [convertedCsv, setConvertedCsv] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setConvertedCsv(null);
    }
  };

  const handleConvert = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a PDF file to convert.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdfData = await pdf(fileBuffer);
        const textContent = pdfData.text;

        const result = await convertBankStatementAction({ textContent });

        if (result.success && result.data) {
          setConvertedCsv(result.data.csvContent);
          toast({
            title: 'Conversion Successful',
            description: 'Your bank statement has been converted to CSV.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Conversion Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error("PDF Parsing or Conversion Error:", error);
        toast({
            title: 'Conversion Failed',
            description: error instanceof Error ? error.message : "An unknown error occurred during PDF processing.",
            variant: 'destructive',
        });
      }
    });
  };

  const handleDownload = () => {
    if (!convertedCsv) return;
    const blob = new Blob([convertedCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const originalFileName = file?.name.replace(/\.pdf$/i, '') || 'statement';
    link.setAttribute('download', `${originalFileName}-sage-import.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold">Bank Statement to CSV Converter</h1>
          <p className="text-muted-foreground">
            Upload your PDF bank statement to convert it into a Sage-compatible CSV file.
          </p>
        </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Statement</CardTitle>
          <CardDescription>
            The conversion is handled by AI. Please review the generated CSV for accuracy before importing into Sage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">PDF Bank Statement</Label>
            <div className="flex items-center gap-4">
              <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              <Label htmlFor="pdf-upload" className="flex-1 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Click or drag file to this area to upload</p>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <Button onClick={handleConvert} disabled={isConverting || !file} className="w-full">
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
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex flex-col items-center gap-4 text-center">
                 <CheckCircle className="h-12 w-12 text-green-500" />
                 <p className="font-medium">Conversion complete!</p>
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
