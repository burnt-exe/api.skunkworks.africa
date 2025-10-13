'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import type { DocumentData, LineItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import DocumentPreview from '@/components/document-preview';
import { useToast } from '@/hooks/use-toast';
import { convertPdfToDocxAction, convertToXlsxAction } from '@/app/actions';
import { PlusCircle, Trash2, Printer, Download, Upload, LoaderCircle } from 'lucide-react';
import React from 'react';

/* -------------------------------------------------------------------------- */
/*                            Initial Template Data                           */
/* -------------------------------------------------------------------------- */
const initialData: DocumentData = {
  title: 'PAYSLIP',
  logoUrl: '',
  from: { name: 'Your Company', address: '123 Main St, Anytown, USA' },
  to: { name: 'Employee Name', address: '789 Pine St, Workerville, USA' },
  details: { label: 'Employee ID', value: 'EMP-007' },
  date: '',
  payPeriod: '',
  lineItems: [
    { description: 'Basic Salary', quantity: 1, price: 3000 },
    { description: 'Bonus', quantity: 1, price: 500 },
  ],
  deductions: [
    { description: 'Tax', quantity: 1, price: 400 },
    { description: 'Insurance', quantity: 1, price: 100 },
  ],
  notes: 'Payment has been processed via direct deposit.',
};

export const dynamic = 'force-dynamic';

/* -------------------------------------------------------------------------- */
/*                             Payslip Component                              */
/* -------------------------------------------------------------------------- */
export default function PayslipPage() {
  const [data, setData] = useState<DocumentData>(initialData);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, startTransition] = useTransition();
  const mounted = useRef(false);

  /* -------------------------- Initialize Defaults -------------------------- */
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    setData((prev) => ({
      ...prev,
      date: today.toISOString().split('T')[0],
      payPeriod: `${formatDate(firstDay)} - ${formatDate(lastDay)}`,
    }));
  }, []);

  /* ---------------------------- Event Handlers ----------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
      setData((prev) => ({
        ...prev,
        [keys[0]]: { ...(prev[keys[0] as keyof DocumentData] as object), [keys[1]]: value },
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setData((prev) => ({ ...prev, logoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number,
    type: 'earnings' | 'deductions',
  ) => {
    const key = type === 'earnings' ? 'lineItems' : 'deductions';
    const items = [...(data[key] ?? [])];
    const parsed = typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value;
    items[index] = { ...items[index], [field]: parsed };
    setData((prev) => ({ ...prev, [key]: items }));
  };

  const addLineItem = (type: 'earnings' | 'deductions') => {
    const key = type === 'earnings' ? 'lineItems' : 'deductions';
    const items = [...(data[key] ?? [])];
    items.push({ description: '', quantity: 1, price: 0 });
    setData((prev) => ({ ...prev, [key]: items }));
  };

  const removeLineItem = (index: number, type: 'earnings' | 'deductions') => {
    const key = type === 'earnings' ? 'lineItems' : 'deductions';
    const items = (data[key] ?? []).filter((_, i) => i !== index);
    setData((prev) => ({ ...prev, [key]: items }));
  };

  /* --------------------------- Computed Totals ----------------------------- */
  const subtotalEarnings = data.lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDeductions = (data.deductions ?? []).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netPay = subtotalEarnings - totalDeductions;

  /* ----------------------------- Export Logic ------------------------------ */
  const handleWordExport = async () => {
    startTransition(async () => {
      // NOTE: This uses a placeholder for PDF generation. A full implementation
      // would generate a PDF from the current `data` state on the server.
      const dummyPdfDataUri = "data:application/pdf;base64,JVBERi0xLjcK...";
      const result = await convertPdfToDocxAction({ pdfDataUri: dummyPdfDataUri });
      
      if (result.success && result.data?.docxDataUri) {
        const link = document.createElement('a');
        link.href = result.data.docxDataUri;
        link.download = `${data.details.value || 'payslip'}.docx`;
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

  const handleExcelExport = async () => {
    startTransition(async () => {
      const result = await convertToXlsxAction(data);

      if (result.success && result.data?.xlsxDataUri) {
        const link = document.createElement('a');
        link.href = result.data.xlsxDataUri;
        link.download = `${data.details.value || 'payslip'}.xlsx`;
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

  /* ----------------------------- UI Rendering ------------------------------ */
  return (
    <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left Side — Form */}
      <ScrollArea className="h-full max-h-[calc(100vh-4rem)] rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Payslip Details</h1>
          <p className="text-muted-foreground">Fill in the details to generate the payslip.</p>
          <Separator className="my-6" />

          {/* Company & Employee Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from.name">Company Details</Label>
              <Input id="from.name" name="from.name" value={data.from.name} onChange={handleInputChange} />
              <Textarea name="from.address" value={data.from.address} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to.name">Employee Details</Label>
              <Input id="to.name" name="to.name" value={data.to.name} onChange={handleInputChange} />
              <Textarea name="to.address" value={data.to.address} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Company Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={data.logoUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-logo.com/logo.png"
                  className="flex-grow"
                />
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="details.value">Employee ID</Label>
                <Input id="details.value" name="details.value" value={data.details.value} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Pay Date</Label>
                <Input id="date" name="date" type="date" value={data.date} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payPeriod">Pay Period</Label>
                <Input id="payPeriod" name="payPeriod" value={data.payPeriod} onChange={handleInputChange} />
              </div>
            </div>

            {/* --------------------------- Earnings Table --------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px] text-right">Amount</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value, 'earnings')}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="text-right"
                            value={item.price}
                            onChange={(e) => handleLineItemChange(index, 'price', e.target.value, 'earnings')}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeLineItem(index, 'earnings')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => addLineItem('earnings')}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Earning
                </Button>
              </CardContent>
            </Card>

            {/* -------------------------- Deductions Table -------------------------- */}
            <Card>
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px] text-right">Amount</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.deductions ?? []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value, 'deductions')}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="text-right"
                            value={item.price}
                            onChange={(e) => handleLineItemChange(index, 'price', e.target.value, 'deductions')}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeLineItem(index, 'deductions')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => addLineItem('deductions')}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Deduction
                </Button>
              </CardContent>
            </Card>

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Total Earnings</span>
                <span className="text-green-600 font-semibold">${subtotalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Deductions</span>
                <span className="text-red-600 font-semibold">-${totalDeductions.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net Pay</span>
                <span className="text-blue-700">${netPay.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={data.notes} onChange={handleInputChange} />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Right Side — Preview & Actions */}
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
              <Button variant="outline" onClick={handleWordExport} disabled={isExporting}>
                 {isExporting ? <LoaderCircle className="animate-spin mr-2" /> : <Download className="mr-2" />} Word
              </Button>
              <Button variant="outline" onClick={handleExcelExport} disabled={isExporting}>
                {isExporting ? <LoaderCircle className="animate-spin mr-2" /> : <Download className="mr-2" />} Excel
              </Button>
            </CardContent>
          </Card>
          <DocumentPreview data={data} />
        </div>
      </div>
    </div>
  );
}

    