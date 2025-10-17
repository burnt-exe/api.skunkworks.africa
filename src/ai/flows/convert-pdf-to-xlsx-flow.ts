'use server';
/**
 * @fileOverview An AI-powered tool to convert a PDF document into an XLSX file.
 *
 * - convertPdfToXlsx - A function that handles the conversion process.
 * - ConvertPdfToXlsxInput - The input type for the function.
 * - ConvertPdfToXlsxOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as XLSX from 'xlsx';

const ConvertPdfToXlsxInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ConvertPdfToXlsxInput = z.infer<
  typeof ConvertPdfToXlsxInputSchema
>;

const ConvertPdfToXlsxOutputSchema = z.object({
  xlsxDataUri: z
    .string()
    .describe('The generated XLSX file as a data URI.'),
});
export type ConvertPdfToXlsxOutput = z.infer<
  typeof ConvertPdfToXlsxOutputSchema
>;

export async function convertPdfToXlsx(
  input: ConvertPdfToXlsxInput
): Promise<ConvertPdfToXlsxOutput> {
  return convertPdfToXlsxFlow(input);
}

const StructuredCsvSchema = z.object({
  rows: z.array(z.array(z.string())).describe("An array of arrays, where each inner array represents a row in the CSV. The first inner array is the header row."),
});


const extractDataPrompt = ai.definePrompt({
  name: 'extractStructuredDataFromPdfPrompt',
  input: { schema: ConvertPdfToXlsxInputSchema },
  output: { schema: StructuredCsvSchema },
  prompt: `
You are an expert data analyst. Your task is to analyze the content of the provided PDF and convert any tabular data into a structured JSON format representing a CSV.

Identify the main table in the document. Extract the header row and all subsequent data rows.

The output must be a JSON object with a single key "rows", which is an array of arrays. Each inner array represents a row.

Example:
{
  "rows": [
    ["Date", "Description", "Amount"],
    ["2023-01-15", "Initial Deposit", "1000.00"],
    ["2023-01-16", "Office Supplies", "-75.50"]
  ]
}

PDF: {{media url=pdfDataUri}}`,
  config: {
    temperature: 0.1,
  },
});

const convertPdfToXlsxFlow = ai.defineFlow(
  {
    name: 'convertPdfToXlsxFlow',
    inputSchema: ConvertPdfToXlsxInputSchema,
    outputSchema: ConvertPdfToXlsxOutputSchema,
  },
  async (input) => {
    // 1. Extract structured data using the AI model
    const { output } = await extractDataPrompt(input);
    if (!output?.rows || output.rows.length === 0) {
      throw new Error('AI failed to extract tabular data from the PDF.');
    }

    // 2. Build the XLSX document from the structured data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(output.rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // 3. Pack the document into a buffer and convert to base64
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const base64String = (buffer as Buffer).toString('base64');

    const xlsxDataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64String}`;

    return { xlsxDataUri };
  }
);
