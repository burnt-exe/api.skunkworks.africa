
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, LoaderCircle, Download, FileText, CheckCircle, FileType } from 'lucide-react';
import Image from 'next/image';
import { convertPdfToDocxAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default function EasyDocuConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, startTransition] = useTransition();
  const [convertedDocxUrl, setConvertedDocxUrl] = useState<string | null>(null);
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
      setConvertedDocxUrl(null);
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
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Pdf = reader.result as string;

          const result = await convertPdfToDocxAction({ pdfDataUri: base64Pdf });

          if (result.success && result.data?.docxDataUri) {
            setConvertedDocxUrl(result.data.docxDataUri);
            toast({
              title: 'Conversion Successful',
              description: 'Your PDF has been converted to a DOCX file.',
              variant: 'default',
            });
          } else {
            toast({
              title: 'Conversion Failed',
              description: result.error || 'An unknown error occurred.',
              variant: 'destructive',
            });
          }
        };
        reader.onerror = (error) => {
            throw new Error("Failed to read the file.");
        }
      } catch (error) {
        console.error("Conversion Error:", error);
        toast({
            title: 'Conversion Failed',
            description: error instanceof Error ? error.message : "An unknown error occurred during the process.",
            variant: 'destructive',
        });
      }
    });
  };

  const handleDownload = () => {
    if (!convertedDocxUrl) return;
    const link = document.createElement('a');
    link.href = convertedDocxUrl;
    const originalFileName = file?.name.replace(/\.pdf$/i, '') || 'document';
    link.setAttribute('download', `${originalFileName}.docx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Image src="/rambrass-logo.svg" alt="RAMBRASS Logo" width={60} height={60} />
         <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{fontFamily: "'Space Grotesk', sans-serif"}}>EasyDocuConvert</h1>
            <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif"}}>
                Convert your PDF documents to editable Word (DOCX) files in one click.
            </p>
         </div>
       </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle style={{fontFamily: "'Space Grotesk', sans-serif"}}>Upload PDF</CardTitle>
          <CardDescription style={{fontFamily: "'Inter', sans-serif"}}>
            The conversion is handled by AI. The resulting document will be a DOCX file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload" style={{fontFamily: "'Inter', sans-serif"}}>PDF Document</Label>
            <div className="flex items-center gap-4">
              <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              <Label htmlFor="pdf-upload" className="flex-1 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium" style={{fontFamily: "'Inter', sans-serif"}}>{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground" style={{fontFamily: "'Inter', sans-serif"}}>Click or drag file to this area to upload</p>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <Button onClick={handleConvert} disabled={isConverting || !file} className="w-full font-semibold" style={{fontFamily: "'Inter', sans-serif"}}>
            {isConverting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
                <>
                <FileType className="mr-2 h-4 w-4" />
                Convert to Word (DOCX)
                </>
            )}
          </Button>

          {convertedDocxUrl && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex flex-col items-center gap-4 text-center">
                 <CheckCircle className="h-12 w-12 text-green-500" />
                 <p className="font-medium" style={{fontFamily: "'Inter', sans-serif"}}>Conversion complete!</p>
                 <Button onClick={handleDownload} className="w-full sm:w-auto" style={{fontFamily: "'Inter', sans-serif"}}>
                    <Download className="mr-2 h-4 w-4" />
                    Download DOCX
                 </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
