
'use client';

import { useState, useEffect } from 'react';
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
import { PlusCircle, Trash2, Printer, Download, Upload, ChevronDown } from 'lucide-react';
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

export default function PayslipPage() {
  const [data, setData] = useState<DocumentData>(initialData);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    setData((prev) => ({
      ...prev,
      date: today.toISOString().split('T')[0],
      payPeriod: `${formatDate(firstDayOfMonth)} - ${formatDate(lastDayOfMonth)}`,
    }));
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
      setData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0] as keyof DocumentData], [keys[1]]: value },
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number, type: 'earnings' | 'deductions') => {
    const list = type === 'earnings' ? 'lineItems' : 'deductions';
    const items = data[list] ?? [];
    const newLineItems = [...items];
    const parsedValue = typeof value === 'string' && field !== 'description' ? parseFloat(value) : value;
    newLineItems[index] = { ...newLineItems[index], [field]: parsedValue };
    setData((prev) => ({ ...prev, [list]: newLineItems }));
  };

  const addLineItem = (type: 'earnings' | 'deductions') => {
    const list = type === 'earnings' ? 'lineItems' : 'deductions';
    const items = data[list] ?? [];
    setData((prev) => ({
      ...prev,
      [list]: [...items, { description: '', quantity: 1, price: 0 }],
    }));
  };

  const removeLineItem = (index: number, type: 'earnings' | 'deductions') => {
    const list = type === 'earnings' ? 'lineItems' : 'deductions';
    const items = data[list] ?? [];
    const newLineItems = items.filter((_, i) => i !== index);
    setData((prev) => ({ ...prev, [list]: newLineItems }));
  };

  return (
    <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2">
      <ScrollArea className="h-full max-h-[calc(100vh-4rem)] rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Payslip Details</h1>
          <p className="text-muted-foreground">Fill in the details to generate the payslip.</p>
          <Separator className="my-6" />
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from.name">Company Details</Label>
              <Input id="from.name" name="from.name" placeholder="Company Name" value={data.from.name} onChange={handleInputChange} />
              <Textarea name="from.address" placeholder="Company Address" value={data.from.address} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to.name">Employee Details</Label>
              <Input id="to.name" name="to.name" placeholder="Employee Name" value={data.to.name} onChange={handleInputChange} />
              <Textarea name="to.address" placeholder="Employee Address" value={data.to.address} onChange={handleInputChange} />
            </div>

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

            <Card>
              <CardHeader><CardTitle>Earnings</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Description</TableHead><TableHead className="w-[120px]">Amount</TableHead><TableHead className="w-[50px]"></TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell><Input value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value, 'earnings')} /></TableCell>
                        <TableCell><Input type="number" value={item.price} onChange={(e) => handleLineItemChange(index, 'price', e.target.value, 'earnings')} /></TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeLineItem(index, 'earnings')}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => addLineItem('earnings')}><PlusCircle className="mr-2 h-4 w-4" />Add Earning</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Deductions</CardTitle></CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow><TableHead>Description</TableHead><TableHead className="w-[120px]">Amount</TableHead><TableHead className="w-[50px]"></TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.deductions ?? []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell><Input value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value, 'deductions')} /></TableCell>
                        <TableCell><Input type="number" value={item.price} onChange={(e) => handleLineItemChange(index, 'price', e.target.value, 'deductions')} /></TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeLineItem(index, 'deductions')}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => addLineItem('deductions')}><PlusCircle className="mr-2 h-4 w-4" />Add Deduction</Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any additional notes..." value={data.notes} onChange={handleInputChange} />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="h-full">
         <div className="sticky top-6 space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2"/>
                        Print / PDF
                    </Button>
                    <Button variant="outline" disabled>
                        <Download className="mr-2" />
                        Word
                    </Button>
                     <Button variant="outline" disabled>
                        <Download className="mr-2" />
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
