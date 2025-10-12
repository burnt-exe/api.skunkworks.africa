
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { PlusCircle, Trash2, Printer, Download, Upload } from 'lucide-react';
import React from 'react';

const initialData: DocumentData = {
  title: 'RECEIPT',
  logoUrl: '',
  from: { name: 'Your Company', address: '123 Main St, Anytown, USA' },
  to: { name: 'Customer Name', address: '456 Oak Ave, Otherville, USA' },
  details: {
    label: 'Receipt No.',
    value: '',
  },
  date: '',
  lineItems: [
    { description: 'Service Rendered', quantity: 1, price: 200.0 },
    { description: 'Product Sold', quantity: 2, price: 25.0 },
  ],
  notes: 'Thank you for your payment.',
  paymentMethod: 'Credit Card',
  amountPaid: 250.00,
};

export const dynamic = 'force-dynamic';

export default function ReceiptPage() {
  const [data, setData] = useState<DocumentData>(initialData);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        value: `RCPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      },
      date: new Date().toISOString().split('T')[0],
    }));
  }, []);

  const subtotal = useMemo(() => data.lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0), [data.lineItems]);
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
      const isNumeric = ['amountPaid'].includes(name);
      setData((prev) => ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }));
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

  return (
    <div className="grid h-full min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-2">
      <ScrollArea className="h-full max-h-[calc(100vh-4rem)] rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Receipt Details</h1>
          <p className="text-muted-foreground">Fill in the details to generate your receipt.</p>
          <Separator className="my-6" />
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from.name">From</Label>
                <Input id="from.name" name="from.name" placeholder="Your Company" value={data.from.name} onChange={handleInputChange} />
                <Textarea name="from.address" placeholder="Your Address" value={data.from.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to.name">To</Label>
                <Input id="to.name" name="to.name" placeholder="Customer's Name" value={data.to.name} onChange={handleInputChange} />
                <Textarea name="to.address" placeholder="Customer's Address" value={data.to.address} onChange={handleInputChange} />
              </div>
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
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="details.value">Receipt Number</Label>
                <Input id="details.value" name="details.value" value={data.details.value} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input id="date" name="date" type="date" value={data.date} onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <Label>Items/Services</Label>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Description</TableHead><TableHead className="w-[100px]">Quantity</TableHead><TableHead className="w-[120px]">Price</TableHead><TableHead className="w-[50px]"></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {data.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell><Input value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} /></TableCell>
                      <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)} /></TableCell>
                      <TableCell><Input type="number" value={item.price} onChange={(e) => handleLineItemChange(index, 'price', e.target.value)} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeLineItem(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-4" onClick={addLineItem}><PlusCircle className="mr-2 h-4 w-4" />Add Item</Button>
            </div>
            
            <Card>
                <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Input id="paymentMethod" name="paymentMethod" value={data.paymentMethod} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amountPaid">Amount Paid</Label>
                        <Input id="amountPaid" name="amountPaid" type="number" value={data.amountPaid} onChange={handleInputChange} />
                    </div>
                    <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between font-medium">
                        <span>Balance Due</span>
                        <span>{(subtotal - (data.amountPaid ?? 0)).toFixed(2)}</span>
                    </div>
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
