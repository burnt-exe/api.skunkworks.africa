
'use client';

import type { DocumentData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { useMemo } from 'react';

interface DocumentPreviewProps {
  data: DocumentData;
}

export default function DocumentPreview({ data }: DocumentPreviewProps) {
  const { 
    title, logoUrl, from, to, details, date, dueDate, lineItems, notes, vatRate,
    paymentMethod, amountPaid, payPeriod, deductions, paymentDetails
  } = data;

  const subtotal = useMemo(() => lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0), [lineItems]);
  const vatAmount = useMemo(() => subtotal * ((vatRate ?? 0) / 100), [subtotal, vatRate]);
  const total = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);

  const earningsTotal = useMemo(() => lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0), [lineItems]);
  const deductionsTotal = useMemo(() => (deductions ?? []).reduce((acc, item) => acc + item.quantity * item.price, 0), [deductions]);
  const netPay = useMemo(() => earningsTotal - deductionsTotal, [earningsTotal, deductionsTotal]);

  const renderTotals = () => {
    switch(title) {
        case 'PAYSLIP':
            return (
                <>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Total Earnings</TableCell>
                        <TableCell className="text-right font-semibold">{earningsTotal.toFixed(2)}</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Total Deductions</TableCell>
                        <TableCell className="text-right font-semibold">{deductionsTotal.toFixed(2)}</TableCell>
                    </TableRow>
                     <TableRow className="text-lg bg-muted/50">
                        <TableCell colSpan={3} className="text-right font-bold">Net Pay</TableCell>
                        <TableCell className="text-right font-bold">{netPay.toFixed(2)}</TableCell>
                    </TableRow>
                </>
            );
        case 'RECEIPT':
             return (
                <>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Subtotal</TableCell>
                        <TableCell className="text-right">{subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Amount Paid</TableCell>
                        <TableCell className="text-right">{(amountPaid ?? 0).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="text-lg bg-muted/50">
                        <TableCell colSpan={3} className="text-right font-bold">Balance Due</TableCell>
                        <TableCell className="text-right font-bold">{(subtotal - (amountPaid ?? 0)).toFixed(2)}</TableCell>
                    </TableRow>
                </>
            )
        default:
             return (
                <>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Subtotal</TableCell>
                        <TableCell className="text-right">{subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                    {vatRate ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">VAT ({vatRate}%)</TableCell>
                        <TableCell className="text-right">{vatAmount.toFixed(2)}</TableCell>
                    </TableRow>
                    ) : null}
                    <TableRow className="text-lg bg-primary/10">
                        <TableCell colSpan={3} className="text-right font-bold text-primary">Total</TableCell>
                        <TableCell className="text-right font-bold text-primary">{total.toFixed(2)}</TableCell>
                    </TableRow>
                </>
            );
    }
  }

  const getDueDateLabel = () => {
    if (!dueDate) return null;
    switch(title) {
        case 'QUOTE':
            return 'Valid Until';
        default:
            return 'Due Date';
    }
  }

  const dueDateLabel = getDueDateLabel();


  return (
    <Card className="printable-area h-full w-full overflow-auto shadow-lg" id="document-preview">
      <CardContent className="p-8 sm:p-12 text-sm">
        <div className="space-y-8">
          <header className="flex items-start justify-between">
            <div>
              {logoUrl ? (
                <Image src={logoUrl} alt="Company Logo" width={140} height={70} className="object-contain" data-ai-hint="company logo"/>
              ) : (
                <div className="h-[70px] w-[140px] bg-muted flex items-center justify-center text-muted-foreground">
                   <Image src="/icon.png" alt="EasyFile Logo" width={140} height={70} className="object-contain" />
                </div>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-primary tracking-wider">{title}</h1>
              <p className="text-muted-foreground">{details.label}: {details.value}</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="font-semibold text-muted-foreground mb-2">From</h2>
              <p className="font-bold">{from.name}</p>
              <p className="whitespace-pre-line">{from.address}</p>
            </div>
            <div className="text-right">
              <h2 className="font-semibold text-muted-foreground mb-2">To</h2>
              <p className="font-bold">{to.name}</p>
              <p className="whitespace-pre-line">{to.address}</p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-8 sm:grid-cols-4">
             <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(date + 'T00:00:00').toLocaleDateString()}</p>
             </div>
             {dueDateLabel && (
             <div>
                <p className="text-muted-foreground">{dueDateLabel}</p>
                <p className="font-medium">{new Date(dueDate + 'T00:00:00').toLocaleDateString()}</p>
             </div>
             )}
              {payPeriod && (
             <div>
                <p className="text-muted-foreground">Pay Period</p>
                <p className="font-medium">{payPeriod}</p>
             </div>
             )}
             {paymentMethod && (
                 <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{paymentMethod}</p>
                 </div>
             )}
          </section>

          <section>
            {title === 'PAYSLIP' ? <h3 className="font-semibold mb-2 text-lg">Earnings</h3> : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {deductions && deductions.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2 text-lg">Deductions</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deductions.map((item, index) => (
                                <TableRow key={index}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{(item.quantity * item.price).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
          </section>
          
          <Separator />

          <section className="flex justify-end">
            <div className="w-full max-w-xs">
                 <Table>
                    <TableBody>
                        {renderTotals()}
                    </TableBody>
                </Table>
            </div>
          </section>

          {(notes || paymentDetails) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {notes && (
                <div>
                <h2 className="font-semibold text-muted-foreground mb-2">Notes</h2>
                <p className="whitespace-pre-line">{notes}</p>
                </div>
            )}
            {paymentDetails && (
                <div>
                <h2 className="font-semibold text-muted-foreground mb-2">Payment Details</h2>
                <div className="space-y-1">
                    <p><span className="font-medium">Bank:</span> {paymentDetails.bankName}</p>
                    <p><span className="font-medium">Account Name:</span> {paymentDetails.accountName}</p>
                    <p><span className="font-medium">Account No:</span> {paymentDetails.accountNumber}</p>
                    <p><span className="font-medium">Sort Code/BIC:</span> {paymentDetails.sortCode}</p>
                </div>
                </div>
            )}
            </section>
          )}


          <footer className="text-center text-xs text-muted-foreground pt-8">
            <p>Thank you for your business!</p>
            <p>{from.name} - {from.address}</p>
          </footer>
        </div>
      </CardContent>
    </Card>
  );
}
