'use client';

import React, { useState, useTransition, useEffect } from 'react';
import type { DocumentData, LineItem } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import DocumentPreview from '@/components/document-preview';
import { suggestItemsAction, convertToXlsxAction, convertPdfToDocxAction } from '@/app/actions';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ────────────────────────────────────────────────
// ✅ Initial Data Template
// ────────────────────────────────────────────────
const initialData: DocumentData = {
  title: 'QUOTE',
  logoUrl: '',
  from: { name: 'Your Company', address: '123 Main St, Anytown, USA' },
  to: { name: 'Client Company', address: '456 Oak Ave, Otherville, USA' },
  details: { label: 'Quote No.', value: '' },
  date: '',
  dueDate: '',
  lineItems: [
    { description: 'Item 1', quantity: 2, price: 50.0 },
    { description: 'Item 2', quantity: 1, price: 150.0 },
  ],
  notes: 'This quote is valid for 30 days.',
  vatRate: 20,
  paymentDetails: {
    bankName: 'Global Bank',
    accountName: 'Your Company Inc.',
    accountNumber: '1234567890',
    sortCode: '12-34-56',
  },
};

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────
// ✅ Quote Page Component
// ────────────────────────────────────────────────
export default function QuotePage() {
  const [data, setData] = useState<DocumentData>(initialData);
  const [aiState, setAiState] = useState({ businessType: 'Consulting', vatRate: '20' });
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExportTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ────────────────────────────────────────────────
  // ✅ Initialize dates and quote number
  // ────────────────────────────────────────────────
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        value: `QT-${new Date().getFullYear()}-${String(
          Math.floor(Math.random() * 9000) + 1000
        )}`,
      },
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).toISOString().split('T')[0],
    }));
  }, []);

  // ────────────────────────────────────────────────
  // ✅ Type-safe state update helpers
  // ────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    setData((prev) => {
      if (keys.length > 1) {
        const [parent, child] = keys;
        const parentValue = prev[parent as keyof DocumentData];
        return {
          ...prev,
          [parent]: {
            ...(typeof parentValue === 'object' && parentValue !== null
              ? parentValue
              : {}),
            [child]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.onerror = () => {
        toast({
          title: 'Upload failed',
          description: 'An error occurred while reading the file.',
          variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setData((prev) => {
      const updated = [...prev.lineItems];
      const parsedValue =
        typeof value === 'string' && field !== 'description'
          ? parseFloat(value) || 0
          : value;
      updated[index] = { ...updated[index], [field]: parsedValue };
      return { ...prev, lineItems: updated };
    });
  };

  const addLineItem = () =>
    setData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, price: 0 }],
    }));

  const removeLineItem = (index: number) =>
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));

  // ────────────────────────────────────────────────
  // ✅ AI Suggestion Handler
  // ────────────────────────────────────────────────
  const handleAiSuggest = () => {
    startTransition(async () => {
      const result = await suggestItemsAction({
        businessType: aiState.businessType,
        vatRate: parseFloat(aiState.vatRate) / 100,
      });
      if (result.success && result.data) {
        setData((prev) => ({ ...prev, lineItems: result.data! }));
        toast({
          title: 'AI Updated Line Items',
          description: 'New suggestions added successfully.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'AI suggestion failed.',
          variant: 'destructive',
        });
      }
    });
  };
  
    // ────────────────────────────────────────────────
    // ✅ Export Handlers
    // ────────────────────────────────────────────────
    const handleWordExport = () => {
      startExportTransition(async () => {
        const dummyPdfDataUri = "data:application/pdf;base64,JVBERi0xLjcK...";
        const result = await convertPdfToDocxAction({ pdfDataUri: dummyPdfDataUri });
  
        if (result.success && result.data?.docxDataUri) {
          const link = document.createElement('a');
          link.href = result.data.docxDataUri;
          link.download = `${data.details.value || 'quote'}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          toast({
            title: 'Word Export Failed',
            description: result.error || 'Unable to generate Word document.',
            variant: 'destructive',
          });
        }
      });
    };
  
    const handleExcelExport = () => {
      startExportTransition(async () => {
        const result = await convertToXlsxAction(data);
        if (result.success && result.data?.xlsxDataUri) {
          const link = document.createElement('a');
          link.href = result.data.xlsxDataUri;
          link.download = `${data.details.value || 'quote'}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          toast({
            title: 'Excel Export Failed',
            description: result.error || 'Unable to generate Excel file.',
            variant: 'destructive',
          });
        }
      });
    };

  // ────────────────────────────────────────────────
  // ✅ UI Rendering
  // ────────────────────────────────────────────────
  return (
    <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left Side – Form */}
      <ScrollArea className="h-full max-h-[calc(100vh-4rem)] rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Quote Details</h1>
          <p className="text-muted-foreground">
            Fill in the details to generate your quote.
          </p>
          <Separator className="my-6" />

          <div className="space-y-6">
            {/* ───── AI Assistant ───── */}
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
                          onChange={(e) =>
                            setAiState({ ...aiState, businessType: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="vatRateAi">VAT Rate (%)</Label>
                        <Input
                          id="vatRateAi"
                          type="number"
                          value={aiState.vatRate}
                          onChange={(e) =>
                            setAiState({ ...aiState, vatRate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={handleAiSuggest} disabled={isPending}>
                      {isPending ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Sparkles className="mr-2" />
                      )}
                      Suggest Items
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* ───── Company Info ───── */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from.name">From</Label>
                <Input
                  id="from.name"
                  name="from.name"
                  placeholder="Your Company"
                  value={data.from.name}
                  onChange={handleInputChange}
                />
                <Textarea
                  name="from.address"
                  placeholder="Your Address"
                  value={data.from.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to.name">To</Label>
                <Input
                  id="to.name"
                  name="to.name"
                  placeholder="Client's Company"
                  value={data.to.name}
                  onChange={handleInputChange}
                />
                <Textarea
                  name="to.address"
                  placeholder="Client's Address"
                  value={data.to.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* ───── Logo Upload ───── */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Company Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  placeholder="https://your-logo.com/logo.png"
                  value={data.logoUrl}
                  onChange={handleInputChange}
                  className="flex-grow"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
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

            {/* ───── Quote Details ───── */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="details.value">Quote Number</Label>
                <Input
                  id="details.value"
                  name="details.value"
                  value={data.details.value}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={data.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Valid Until</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={data.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* ───── Line Items ───── */}
            <div>
              <Label>Line Items</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Quantity</TableHead>
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
                          onChange={(e) =>
                            handleLineItemChange(index, 'description', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(index, 'quantity', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleLineItemChange(index, 'price', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(index)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={addLineItem}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* ───── Payment Details ───── */}
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
                    <div className="space-y-2">
                      <Label htmlFor="paymentDetails.bankName">Bank Name</Label>
                      <Input
                        id="paymentDetails.bankName"
                        name="paymentDetails.bankName"
                        value={data.paymentDetails?.bankName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDetails.accountName">
                        Account Name
                      </Label>
                      <Input
                        id="paymentDetails.accountName"
                        name="paymentDetails.accountName"
                        value={data.paymentDetails?.accountName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDetails.accountNumber">
                        Account Number
                      </Label>
                      <Input
                        id="paymentDetails.accountNumber"
                        name="paymentDetails.accountNumber"
                        value={data.paymentDetails?.accountNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDetails.sortCode">
                        Sort Code / BIC
                      </Label>
                      <Input
                        id="paymentDetails.sortCode"
                        name="paymentDetails.sortCode"
                        value={data.paymentDetails?.sortCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* ───── Notes & VAT ───── */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any additional notes..."
                value={data.notes}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatRate">VAT Rate (%)</Label>
              <Input
                id="vatRate"
                name="vatRate"
                type="number"
                placeholder="20"
                value={data.vatRate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Right Side – Preview & Actions */}
      <div className="h-full">
        <div className="sticky top-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button onClick={() => window.print()}>
                <Printer className="mr-2" />
                Print / PDF
              </Button>
              <Button variant="outline" onClick={handleWordExport} disabled={isExporting}>
                {isExporting ? <LoaderCircle className="animate-spin mr-2" /> : <Download className="mr-2" />}
                Word
              </Button>
              <Button variant="outline" onClick={handleExcelExport} disabled={isExporting}>
                {isExporting ? <LoaderCircle className="animate-spin mr-2" /> : <Download className="mr-2" />}
                Excel
              </Button>
            </CardContent>
          </Card>

          <DocumentPreview data={data} />
        </div>
      </div>
    </div>
  );
}
