'use client';

import { useState, useTransition, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import {
  LoaderCircle,
  UploadCloud,
  Download,
  CheckCircle,
  FileUp,
  ArrowRight,
  File,
  FileQuestion,
  FileText,
  Sheet,
  FileImage,
} from 'lucide-react';
import Image from 'next/image';
import {
  convertPdfToDocxAction,
  convertPdfToXlsxAction,
  convertPdfToImageAction,
  convertToPdfAction,
} from '@/app/actions';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SupportedFormat = 'pdf' | 'docx' | 'xlsx' | 'jpeg';

const formatDetails: Record<
  SupportedFormat,
  { label: string; mime: string; icon: React.ElementType }
> = {
  pdf: { label: 'PDF Document', mime: 'application/pdf', icon: FileText },
  docx: { label: 'Microsoft Word', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: FileText },
  xlsx: { label: 'Microsoft Excel', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: Sheet },
  jpeg: { label: 'Image', mime: 'image/jpeg', icon: FileImage },
};

const formatOptions = Object.keys(formatDetails) as SupportedFormat[];

export default function EasyDocuConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, startTransition] = useTransition();
  const [convertedFile, setConvertedFile] = useState<{
    url: string;
    fileName: string;
  } | null>(null);

  const [fromFormat, setFromFormat] = useState<SupportedFormat>('pdf');
  const [toFormat, setToFormat] = useState<SupportedFormat>('docx');
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== formatDetails[fromFormat].mime) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: `Please upload a ${fromFormat.toUpperCase()} file.`,
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
        description: `Please select a ${fromFormat.toUpperCase()} file to convert.`,
      });
      return;
    }

    startTransition(async () => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64File = reader.result as string;
          let result;

          // From PDF conversions
          if (fromFormat === 'pdf') {
            switch (toFormat) {
              case 'docx':
                result = await convertPdfToDocxAction({ pdfDataUri: base64File });
                break;
              case 'xlsx':
                result = await convertPdfToXlsxAction({ pdfDataUri: base64File });
                break;
              case 'jpeg':
                result = await convertPdfToImageAction({ pdfDataUri: base64File });
                break;
              default:
                throw new Error('Unsupported conversion from PDF.');
            }
          } 
          // To PDF conversions
          else if (toFormat === 'pdf') {
              const sourceTypeMap = {'docx': 'docx', 'xlsx': 'xlsx', 'jpeg': 'jpeg', 'png': 'png'};
              const detectedType = fromFormat === 'docx' ? 'docx' : fromFormat === 'xlsx' ? 'xlsx' : 'jpeg';

              result = await convertToPdfAction({
                fileDataUri: base64File,
                sourceType: detectedType as 'docx' | 'xlsx' | 'jpeg',
              });
          }
          else {
            throw new Error(`Conversion from ${fromFormat.toUpperCase()} to ${toFormat.toUpperCase()} is not supported.`);
          }

          if (result.success && result.data) {
            const url = (result.data as any).pdfDataUri || (result.data as any).docxDataUri || (result.data as any).xlsxDataUri || (result.data as any).imageDataUri;

            if (url) {
              const originalFileName = file.name.split('.').slice(0, -1).join('.') || 'document';
              const newFileName = `${originalFileName}.${toFormat}`;

              setConvertedFile({ url, fileName: newFileName });
              toast({
                title: 'Conversion Successful',
                description: `Your file has been converted to ${toFormat.toUpperCase()}.`,
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
    link.download = convertedFile.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const selectableToFormats = useMemo(() => {
      if(fromFormat === 'pdf') {
          return formatOptions.filter(f => f !== 'pdf');
      }
      return ['pdf'];
  }, [fromFormat]);

  // Auto-select a valid "To" format when "From" format changes
  React.useEffect(() => {
      if(!selectableToFormats.includes(toFormat as any)){
        setToFormat(selectableToFormats[0] as SupportedFormat)
      }
  }, [fromFormat, selectableToFormats, toFormat])

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
              Convert your documents to and from various formats with AI.
            </p>
          </div>
        </div>
        <div className="sm:hidden">
          <SidebarTrigger />
        </div>
      </div>
      <Card className="max-w-3xl mx-auto w-full">
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Document Converter
          </CardTitle>
          <CardDescription style={{ fontFamily: "'Inter', sans-serif" }}>
            The conversion is handled by AI to preserve document structure and
            formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* From */}
            <div className="space-y-2">
                <Label style={{ fontFamily: "'Inter', sans-serif" }}>From</Label>
                <Select value={fromFormat} onValueChange={(v) => {setFromFormat(v as SupportedFormat); setFile(null); setConvertedFile(null)}}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        {formatOptions.map(f => <SelectItem key={f} value={f}>{formatDetails[f].label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex justify-center items-center h-full pt-6">
                <ArrowRight className="h-6 w-6 text-muted-foreground"/>
            </div>

            {/* To */}
            <div className="space-y-2">
                <Label style={{ fontFamily: "'Inter', sans-serif" }}>To</Label>
                <Select value={toFormat} onValueChange={(v) => setToFormat(v as SupportedFormat)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                        {selectableToFormats.map(f => <SelectItem key={f} value={f}>{formatDetails[f as SupportedFormat].label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label
              htmlFor="doc-upload"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Source Document
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="doc-upload"
                type="file"
                accept={formatDetails[fromFormat].mime}
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="doc-upload"
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
                      Click or drag a <span className='font-semibold'>{fromFormat.toUpperCase()}</span> file here to upload
                    </p>
                  </div>
                )}
              </Label>
            </div>
          </div>


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
                  Download {convertedFile.fileName}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
