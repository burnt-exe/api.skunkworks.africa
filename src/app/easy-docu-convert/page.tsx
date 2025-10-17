'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import {
  LoaderCircle,
  FileText,
  UploadCloud,
  Download,
  CheckCircle,
  FileUp,
  FileDown,
  FileImage,
  Sheet,
} from 'lucide-react';
import Image from 'next/image';
import {
  convertPdfToDocxAction,
  convertPdfToXlsxAction,
  convertPdfToImageAction,
} from '@/app/actions';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';

type ConversionFormat = 'docx' | 'xlsx' | 'jpeg';

export default function EasyDocuConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, startTransition] = useTransition();
  const [convertedFile, setConvertedFile] = useState<{
    url: string;
    format: ConversionFormat;
  } | null>(null);
  const [selectedFormat, setSelectedFormat] =
    useState<ConversionFormat>('docx');
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
      setConvertedFile(null);
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
          let result;

          switch (selectedFormat) {
            case 'docx':
              result = await convertPdfToDocxAction({ pdfDataUri: base64Pdf });
              break;
            case 'xlsx':
              result = await convertPdfToXlsxAction({ pdfDataUri: base64Pdf });
              break;
            case 'jpeg':
              result = await convertPdfToImageAction({ pdfDataUri: base64Pdf });
              break;
            default:
              throw new Error('Unsupported format');
          }

          if (result.success && result.data) {
            const url =
              result.data.docxDataUri ||
              result.data.xlsxDataUri ||
              result.data.imageDataUri;
            if (url) {
              setConvertedFile({ url, format: selectedFormat });
              toast({
                title: 'Conversion Successful',
                description: `Your PDF has been converted to a ${selectedFormat.toUpperCase()} file.`,
                variant: 'default',
              });
            } else {
              throw new Error('Conversion resulted in no data.');
            }
          } else {
            throw new Error(result.error || 'An unknown error occurred.');
          }
        };
        reader.onerror = () => {
          throw new Error('Failed to read the file.');
        };
      } catch (error) {
        toast({
          title: 'Conversion Failed',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    const link = document.createElement('a');
    link.href = convertedFile.url;
    const originalFileName = file?.name.replace(/\.pdf$/i, '') || 'document';
    link.setAttribute('download', `${originalFileName}.${convertedFile.format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatOptions: {
    value: ConversionFormat;
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: 'docx', label: 'Microsoft Word', icon: FileText },
    { value: 'xlsx', label: 'Microsoft Excel', icon: Sheet },
    { value: 'jpeg', label: 'Image format', icon: FileImage },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image src="/favicon.ico" alt="EasyFile Logo" width={60} height={60} />
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              EasyDocuConvert
            </h1>
            <p
              className="text-muted-foreground"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Convert your PDF documents to various formats in one click.
            </p>
          </div>
        </div>
        <div className="sm:hidden">
          <SidebarTrigger />
        </div>
      </div>
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Upload and Convert
          </CardTitle>
          <CardDescription style={{ fontFamily: "'Inter', sans-serif" }}>
            The conversion is handled by AI to preserve document structure and
            formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="pdf-upload"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              PDF Document
            </Label>
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
                    <FileUp className="h-6 w-6 text-primary" />
                    <span
                      className="font-medium"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {file.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <p
                      className="text-muted-foreground"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Click or drag file to this area to upload
                    </p>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <RadioGroup
            value={selectedFormat}
            onValueChange={(val) => setSelectedFormat(val as ConversionFormat)}
            className="grid grid-cols-1 gap-4"
          >
            {formatOptions.map(({ value, label, icon: Icon }) => (
              <Label
                key={value}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all',
                  selectedFormat === value &&
                    'border-primary ring-2 ring-primary'
                )}
              >
                <RadioGroupItem value={value} id={value} />
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium flex-1">{label}</span>
                <span className="text-xs font-mono uppercase bg-muted px-2 py-1 rounded-md">
                  {value}
                </span>
              </Label>
            ))}
          </RadioGroup>

          <Button
            onClick={handleConvert}
            disabled={isConverting || !file}
            className="w-full font-semibold"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isConverting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert'
            )}
          </Button>

          {convertedFile && (
            <Card className="bg-muted/50 border-green-500/40">
              <CardContent className="p-4 flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p
                  className="font-medium"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Conversion complete!
                </p>
                <Button
                  onClick={handleDownload}
                  className="w-full sm:w-auto"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {convertedFile.format.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
