
'use server';
/**
 * @fileOverview An AI-powered tool to convert document data into an XLSX file.
 * This is a placeholder and does not perform a real conversion.
 *
 * - convertToXlsx - A function that handles the conversion process.
 * - ConvertToXlsxInput - The input type for the function.
 * - ConvertToXlsxOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { DocumentData } from '@/types';
import * as XLSX from 'xlsx';

// Define a Zod schema for DocumentData for runtime validation if needed.
// This is a simplified version. A complete one would be more complex.
const DocumentDataSchema = z.custom<DocumentData>();

const ConvertToXlsxInputSchema = DocumentDataSchema;
export type ConvertToXlsxInput = z.infer<typeof ConvertToXlsxInputSchema>;

const ConvertToXlsxOutputSchema = z.object({
  xlsxDataUri: z.string().describe("The generated XLSX file as a data URI. This is a placeholder."),
});
export type ConvertToXlsxOutput = z.infer<typeof ConvertToXlsxOutputSchema>;

export async function convertToXlsx(input: ConvertToXlsxInput): Promise<ConvertToXlsxOutput> {
  return convertToXlsxFlow(input);
}

const convertToXlsxFlow = ai.defineFlow(
  {
    name: 'convertToXlsxFlow',
    inputSchema: ConvertToXlsxInputSchema,
    outputSchema: ConvertToXlsxOutputSchema,
  },
  async (data) => {
    // 1. Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const ws_name = data.title.replace(/\s+/g, '_') || "Sheet1";

    // 2. Prepare data for the worksheet
    const headers = ["Description", "Quantity", "Price", "Total"];
    const lineItemsData = data.lineItems.map(item => [
        item.description,
        item.quantity,
        item.price,
        item.quantity * item.price
    ]);

    const subtotal = data.lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const vatAmount = subtotal * ((data.vatRate || 0) / 100);
    const total = subtotal + vatAmount;

    // 3. Construct the worksheet data array
    const ws_data = [
        headers,
        ...lineItemsData,
        [], // Empty row for spacing
        ["", "", "Subtotal", subtotal],
    ];

    if (data.vatRate) {
        ws_data.push(["", "", `VAT (${data.vatRate}%)`, vatAmount]);
    }

    ws_data.push(["", "", "Total", total]);

    // 4. Create the worksheet and append it to the workbook
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    // 5. Generate the XLSX file buffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // 6. Convert to base64 data URI
    const base64String = (wbout as Buffer).toString('base64');
    const xlsxDataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64String}`;

    return { xlsxDataUri };
  }
);
