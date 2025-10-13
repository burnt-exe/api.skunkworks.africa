
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DocumentData } from '@/types';

/**
 * DocumentPreview — renders a unified visual template for invoices, receipts,
 * payslips, and related financial documents.
 */
export default function DocumentPreview({ data }: { data: DocumentData }) {
  const {
    title,
    logoUrl,
    from,
    to,
    details,
    date,
    dueDate,
    lineItems = [],
    notes,
    vatRate,
    paymentMethod,
    amountPaid,
    payPeriod,
    deductions = [],
    paymentDetails,
  } = data;

  // ---- Derived totals ------------------------------------------------------
  const subtotal = useMemo(
    () => lineItems.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [lineItems]
  );

  const vatAmount = useMemo(
    () => subtotal * ((vatRate ?? 0) / 100),
    [subtotal, vatRate]
  );

  const total = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);
  const deductionsTotal = useMemo(
    () => deductions.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [deductions]
  );
  const netPay = useMemo(
    () => subtotal - deductionsTotal,
    [subtotal, deductionsTotal]
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (d?: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString() : '';

  // ---- Conditional label ---------------------------------------------------
  const dueDateLabel =
    title === 'QUOTE'
      ? 'Valid Until'
      : dueDate
      ? 'Due Date'
      : undefined;

  // ---- Totals table section -----------------------------------------------
  const renderTotals = () => {
    switch (title) {
      case 'PAYSLIP':
        return (
          <>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total Earnings
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(subtotal)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total Deductions
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(deductionsTotal)}
              </TableCell>
            </TableRow>
            <TableRow className="text-lg bg-muted/50">
              <TableCell colSpan={3} className="text-right font-bold">
                Net Pay
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(netPay)}
              </TableCell>
            </TableRow>
          </>
        );

      case 'RECEIPT':
        return (
          <>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Subtotal
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(subtotal)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Amount Paid
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(amountPaid ?? 0)}
              </TableCell>
            </TableRow>
            <TableRow className="text-lg bg-muted/50">
              <TableCell colSpan={3} className="text-right font-bold">
                Balance Due
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(subtotal - (amountPaid ?? 0))}
              </TableCell>
            </TableRow>
          </>
        );

      default:
        return (
          <>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Subtotal
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(subtotal)}
              </TableCell>
            </TableRow>
            {vatRate ? (
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  VAT ({vatRate}%)
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(vatAmount)}
                </TableCell>
              </TableRow>
            ) : null}
            <TableRow className="text-lg bg-primary/10">
              <TableCell
                colSpan={3}
                className="text-right font-bold text-primary"
              >
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                {formatCurrency(total)}
              </TableCell>
            </TableRow>
          </>
        );
    }
  };

  // ---- Render --------------------------------------------------------------
  return (
    <Card
      id="document-preview"
      className="printable-area h-full w-full overflow-auto shadow-lg"
    >
      <CardContent className="p-8 sm:p-12 text-sm">
        <div className="space-y-8">
          {/* Header */}
          <header className="flex items-start justify-between">
            <div>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Company Logo"
                  width={140}
                  height={70}
                  className="object-contain"
                  data-ai-hint="company logo"
                />
              ) : (
                <div className="h-[70px] w-[140px] bg-muted flex items-center justify-center text-muted-foreground">
                  <Image
                    src="/icon.png"
                    alt="EasyFile Logo"
                    width={140}
                    height={70}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-primary tracking-wider">
                {title}
              </h1>
              {details?.label && details?.value && (
                <p className="text-muted-foreground">
                  {details.label}: {details.value}
                </p>
              )}
            </div>
          </header>

          {/* Parties */}
          <section className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="font-semibold text-muted-foreground mb-2">From</h2>
              <p className="font-bold">{from?.name}</p>
              <p className="whitespace-pre-line">{from?.address}</p>
            </div>
            <div className="text-right">
              <h2 className="font-semibold text-muted-foreground mb-2">To</h2>
              <p className="font-bold">{to?.name}</p>
              <p className="whitespace-pre-line">{to?.address}</p>
            </div>
          </section>

          {/* Dates & meta */}
          <section className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(date)}</p>
            </div>
            {dueDateLabel && (
              <div>
                <p className="text-muted-foreground">{dueDateLabel}</p>
                <p className="font-medium">{formatDate(dueDate)}</p>
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

          {/* Line items */}
          <section>
            {title === 'PAYSLIP' && (
              <h3 className="font-semibold mb-2 text-lg">Earnings</h3>
            )}
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
                {lineItems.length ? (
                  lineItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.quantity * item.price)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center italic">
                      No items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {deductions.length > 0 && (
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
                    {deductions.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.quantity * item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <Separator />

          {/* Totals */}
          <section className="flex justify-end">
            <div className="w-full max-w-xs">
              <Table>
                <TableBody>{renderTotals()}</TableBody>
              </Table>
            </div>
          </section>

          {/* Notes & Payment Details */}
          {(notes || paymentDetails) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {notes && (
                <div>
                  <h2 className="font-semibold text-muted-foreground mb-2">
                    Notes
                  </h2>
                  <p className="whitespace-pre-line">{notes}</p>
                </div>
              )}
              {paymentDetails && (
                <div>
                  <h2 className="font-semibold text-muted-foreground mb-2">
                    Payment Details
                  </h2>
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Bank:</span>{' '}
                      {paymentDetails.bankName}
                    </p>
                    <p>
                      <span className="font-medium">Account Name:</span>{' '}
                      {paymentDetails.accountName}
                    </p>
                    <p>
                      <span className="font-medium">Account No:</span>{' '}
                      {paymentDetails.accountNumber}
                    </p>
                    <p>
                      <span className="font-medium">Sort Code/BIC:</span>{' '}
                      {paymentDetails.sortCode}
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Footer */}
          <footer className="text-center text-xs text-muted-foreground pt-8">
            <p>Thank you for your business!</p>
            {from?.name && (
              <p>
                {from.name} — {from.address}
              </p>
            )}
          </footer>
        </div>
      </CardContent>
    </Card>
  );
}
