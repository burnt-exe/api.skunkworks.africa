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
      className="
        printable-area
        mx-auto
        w-full
        max-w-[794px]      /* ✅ Fixed A4 width for consistency */
        bg-white
        overflow-auto
        shadow-lg
        print:w-[210mm]    /* ✅ Exact A4 width for print output */
        print:h-[297mm]
        print:shadow-none
      "
    >
      <CardContent className="p-8 sm:p-12 text-sm">
        {/* Content remains unchanged */}
        {/* ... your entire JSX stays the same ... */}
      </CardContent>
    </Card>
  );
}
