'use server';
/**
 * @fileOverview AI-powered tool to convert the text content of a bank statement into a structured CSV format compatible with Sage.
 *
 * - convertBankStatement - A function that handles the conversion process.
 * - ConvertBankStatementInput - The input type for the function.
 * - ConvertBankStatementOutput - The return type for the function, containing the CSV content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertBankStatementInputSchema = z.object({
  textContent: z.string().describe('The full text content extracted from the PDF bank statement.'),
});
export type ConvertBankStatementInput = z.infer<typeof ConvertBankStatementInputSchema>;

const ConvertBankStatementOutputSchema = z.object({
  csvContent: z.string().describe('The generated CSV content, formatted for Sage import. The CSV should have a header row: "Date", "Description", "Amount"'),
});
export type ConvertBankStatementOutput = z.infer<typeof ConvertBankStatementOutputSchema>;

export async function convertBankStatement(input: ConvertBankStatementInput): Promise<ConvertBankStatementOutput> {
  return convertBankStatementFlow(input);
}


const conversionPrompt = ai.definePrompt({
    name: "conversionPrompt",
    inputSchema: ConvertBankStatementInputSchema,
    outputSchema: ConvertBankStatementOutputSchema,
    prompt: `
You are an expert financial assistant tasked with converting raw text from a bank statement into a CSV format suitable for Sage accounting software.

The required CSV format has three columns with the exact headers: "Date", "Description", "Amount".
- The "Date" should be in 'YYYY-MM-DD' format.
- The "Description" should be a concise summary of the transaction.
- The "Amount" should be a number. For debits (money out), the amount should be negative. For credits (money in), the amount should be positive. Do not include currency symbols.

Analyze the following text content from a bank statement. Identify each transaction and extract the date, description, and amount.
Ignore any non-transactional lines like balances, fees, or bank information.

Here is the bank statement text:
---
{{{textContent}}}
---

Generate only the CSV content, starting with the header row.
      `,
    config: {
      temperature: 0,
    }
});


const convertBankStatementFlow = ai.defineFlow(
  {
    name: 'convertBankStatementFlow',
    inputSchema: ConvertBankStatementInputSchema,
    outputSchema: ConvertBankStatementOutputSchema,
  },
  async (input) => {
      const response = await conversionPrompt(input);
      const output = response.output;

      if (!output) {
          throw new Error('Failed to generate CSV content from bank statement.');
      }
      return output;
  }
);
