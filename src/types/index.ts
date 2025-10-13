/**
 * Represents a single item or line entry on a financial document,
 * such as an invoice line, payslip earning, or deduction.
 */
export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

/**
 * Minimal company or entity information block
 * for "From" and "To" sections on a document.
 */
export interface CompanyInfo {
  name: string;
  address: string;
}

/**
 * Optional payment metadata for invoices, receipts, or payslips.
 */
export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
}

/**
 * Enumeration of supported document types.
 */
export type DocumentTitle =
  | 'INVOICE'
  | 'PURCHASE ORDER'
  | 'SALES ORDER'
  | 'RECEIPT'
  | 'PAYSLIP'
  | 'QUOTE';

/**
 * Core data structure representing a printable / exportable document.
 *
 * Used throughout the EasyFile suite for both PDF rendering and
 * client-side preview components.
 */
export interface DocumentData {
  /** Document classification, used to adjust totals & formatting. */
  title: DocumentTitle;

  /** Optional company or brand logo. */
  logoUrl?: string;

  /** Originating company or entity. */
  from: CompanyInfo;

  /** Recipient company or client. */
  to: CompanyInfo;

  /** Unique reference label and identifier, e.g. “Invoice #1234”. */
  details: {
    label: string;
    value: string;
  };

  /** Primary document date in ISO 8601 format (`YYYY-MM-DD`). */
  date: string;

  /** Optional due date or validity limit, depending on document type. */
  dueDate?: string;

  /** Line items (e.g. products, services, earnings). */
  lineItems: LineItem[];

  /** Optional remarks, instructions, or footer notes. */
  notes?: string;

  /** VAT rate percentage (e.g. 15 for 15%). */
  vatRate?: number;

  /** Payment method descriptor (e.g. “EFT”, “Cash”, “Credit Card”). */
  paymentMethod?: string;

  /** Amount already paid (for receipts). */
  amountPaid?: number;

  /** For payslips, the relevant pay period label. */
  payPeriod?: string;

  /** For payslips: deduction line items (e.g. tax, benefits). */
  deductions?: LineItem[];

  /** Optional structured banking or payment information. */
  paymentDetails?: PaymentDetails;
}
