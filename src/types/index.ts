export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
}

export interface DocumentData {
  title: 'INVOICE' | 'PURCHASE ORDER' | 'SALES ORDER' | 'RECEIPT' | 'PAYSLIP';
  logoUrl: string;
  from: CompanyInfo;
  to: CompanyInfo;
  details: {
    label: string;
    value: string;
  };
  date: string;
  dueDate?: string;
  lineItems: LineItem[];
  notes: string;
  vatRate?: number;
  paymentMethod?: string;
  amountPaid?: number;
  payPeriod?: string;
  deductions?: LineItem[];
}
