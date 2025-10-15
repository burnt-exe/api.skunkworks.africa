'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { DocumentData, LineItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import DocumentPreview from '@/components/document-preview';
import { suggestItemsAction, convertPdfToDocxAction } from '@/app/actions';
import { convertToXlsxAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  Sparkles,
  Trash2,
  LoaderCircle,
  Printer,
  Download,
  Upload,
  ChevronDown,
} from 'lucide-react';
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const dynamic = 'force-dynamic';

const initialData: DocumentData = {
  title: 'SALES ORDER',
  logoUrl: '',
  from: { name: 'Your Company', address: '123 Main St, Anytown, USA' },
  to: { name: 'Customer Company', address: '456 Oak Ave, Otherville, USA' },
  details: { label: 'SO No.', value: '' },
  date: '',
  lineItems: [
    { description: 'Product X', quantity: 10, price: 75.0 },
    { description: 'Service Y', quantity: 1, price: 300.0 },
  ],
  notes: 'Items will be shipped within 3–5 business days.',
  vatRate: 20,
  paymentDetails: {
    bankName: 'Global Bank',
    accountName: 'Your Company Inc.',
    accountNumber: '1234567890',
    sortCode: '12-34-56',
  },
};

/* -------------------------------------------------------------------------- */
/*                        Utility: Safe Nested State Update                   */
/* -------------------------------------------------------------------------- */
function updateNestedState(obj: any, path: string[], value: any): any {
  if (path.length === 1) return { ...obj, [path[0]]: value };
  const [key, ...rest] = path;
  return { ...obj, [key]: updateNestedState(obj[key] ?? {}, rest, value) };
}

export default function SalesOrderPage() {
  const [data, setData] = useState<DocumentData>(initialData);
  const mounted = useRef(false);
  const [aiState, setAiState] = useState({ businessType: 'Retail', vatRate: '20' });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* -------------------------------------------------------------------------- */
  /*                             Initialize Defaults                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    setData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        value: `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      },
      date: new Date().toISOString().split('T')[0],
    }));
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              Input Handlers                                */
  /* -------------------------------------------------------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => updateNestedState(prev, name.split('.'), value));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...data.lineItems];
    const parsedValue = typeof value === 'string' && field !== 'description' ? parseFloat(value) : value;
    newLineItems[index] = { ...newLineItems[index], [field]: parsedValue };
    setData((prev) => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, price: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    const newLineItems = data.lineItems.filter((_, i) => i !== index);
    setData((prev) => ({ ...prev, lineItems: newLineItems }));
  };

  /* -------------------------------------------------------------------------- */
  /*                            AI Suggestion Logic                             */
  /* -------------------------------------------------------------------------- */
  const debouncedAiSuggest = useDebouncedCallback(() => {
    startTransition(async () => {
      const result = await suggestItemsAction({
        businessType: aiState.businessType,
        vatRate: parseFloat(aiState.vatRate) / 100,
      });
      if (result.success) {
        setData((prev) => ({ ...prev, lineItems: result.data || [] }));
        toast({ title: 'AI Updated Line Items', description: 'Items generated successfully.' });
      } else {
        toast({
          title: 'AI Suggestion Failed',
          description: result.error || 'Something went wrong.',
          variant: 'destructive',
        });
      }
    });
  }, 1000);

  /* -------------------------------------------------------------------------- */
  /*                               Export Handlers                              */
  /* -------------------------------------------------------------------------- */
  const handleWordExport = () => {
    startTransition(async () => {
      // This is a placeholder for generating a PDF from the current data
      // A real implementation would generate a PDF on the server and return the data URI
      const dummyPdfDataUri = "data:application/pdf;base64,JVBERi0xLjcK...";

      const result = await convertPdfToDocxAction({
        pdfDataUri: dummyPdfDataUri,
      });
      if (result.success && result.data?.docxDataUri) {
        window.open(result.data.docxDataUri, '_blank');
      } else {
        toast({ title: 'Word Export Failed', description: result.error, variant: 'destructive' });
      }
    });
  };

  const handleExcelExport = () => {
    startTransition(async () => {
      const result = await convertToXlsxAction(data);
      if (result.success && result.data?.xlsxDataUri) {
        window.open(result.data.xlsxDataUri, '_blank');
      } else {
        toast({ title: 'Excel Export Failed', description: result.error, variant: 'destructive' });
      }
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                               UI Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left Panel — Form */}
      <ScrollArea className="h-full max-h-[calc(100vh-4rem)] rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Sales Order Details</h1>
          <p className="text-muted-foreground">Fill in the details to generate your sales order.</p>
          <Separator className="my-6" />

          {/* ---------------------- AI Assistant Section ----------------------- */}
          <Collapsible asChild>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>AI Assistant</CardTitle>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        value={aiState.businessType}
                        onChange={(e) => setAiState({ ...aiState, businessType: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vatRateAi">VAT Rate (%)</Label>
                      <Input
                        id="vatRateAi"
                        type="number"
                        value={aiState.vatRate}
                        onChange={(e) => setAiState({ ...aiState, vatRate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={debouncedAiSuggest} disabled={isPending}>
                    {isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles className="mr-2" />}
                    Suggest Items
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* ---------------------- Core Document Fields ----------------------- */}
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from.name">From</Label>
                <Input id="from.name" name="from.name" value={data.from.name} onChange={handleInputChange} />
                <Textarea name="from.address" value={data.from.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to.name">To</Label>
                <Input id="to.name" name="to.name" value={data.to.name} onChange={handleInputChange} />
                <Textarea name="to.address" value={data.to.address} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Company Logo</Label>
              <div className="flex items-center gap-4">
                <Input id="logoUrl" name="logoUrl" value={data.logoUrl} onChange={handleInputChange} className="flex-grow" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="details.value">Sales Order Number</Label>
                <Input id="details.value" name="details.value" value={data.details.value} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Order Date</Label>
                <Input id="date" name="date" type="date" value={data.date} onChange={handleInputChange} />
              </div>
            </div>

            {/* ---------------------- Line Items ----------------------- */}
            <div>
              <Label>Line Items</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Qty</TableHead>
                    <TableHead className="w-[120px]">Price</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-4" onClick={addLineItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            {/* ---------------------- Payment Details ----------------------- */}
            <Collapsible asChild>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payment Details</CardTitle>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {data.paymentDetails && Object.entries(data.paymentDetails).map(([key, value]) => (
                      <div className="space-y-2" key={key}>
                        <Label htmlFor={`paymentDetails.${key}`}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                        <Input
                          id={`paymentDetails.${key}`}
                          name={`paymentDetails.${key}`}
                          value={value as string}
                          onChange={handleInputChange}
                        />
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* ---------------------- Notes & VAT ----------------------- */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={data.notes} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatRate">VAT Rate (%)</Label>
              <Input id="vatRate" name="vatRate" type="number" value={data.vatRate} onChange={handleInputChange} />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* ---------------------- Right Panel — Preview & Actions ----------------------- */}
      <div className="h-full">
        <div className="sticky top-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button onClick={() => window.print()}>
                <Printer className="mr-2" /> Print / PDF
              </Button>
              <Button variant="outline" onClick={handleWordExport} disabled={isPending}>
                {isPending ? <LoaderCircle className="animate-spin" /> : <Download className="mr-2" />} Word
              </Button>
              <Button variant="outline" onClick={handleExcelExport} disabled={isPending}>
                {isPending ? <LoaderCircle className="animate-spin" /> : <Download className="mr-2" />} Excel
              </Button>
            </CardContent>
          </Card>

          {isPending && !data ? (
            <div className="animate-pulse h-[600px] rounded-lg bg-muted/30" />
          ) : (
            <DocumentPreview data={data} />
          )}
        </div>
      </div>
    </div>
  );
}