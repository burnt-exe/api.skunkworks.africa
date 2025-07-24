'use server';
/**
 * @fileOverview AI-powered tool that suggests appropriate item descriptions, pricing, and quantities based on user-provided business type and VAT.
 *
 * - suggestItems - A function that handles the item suggestion process.
 * - SuggestItemsInput - The input type for the suggestItems function.
 * - SuggestItemsOutput - The return type for the suggestItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestItemsInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business, e.g., Retail, Manufacturing, Service.'),
  vatRate: z.number().describe('The VAT rate as a decimal, e.g., 0.20 for 20%.'),
});
export type SuggestItemsInput = z.infer<typeof SuggestItemsInputSchema>;

const SuggestItemsOutputSchema = z.array(z.object({
  description: z.string().describe('A suggested item description.'),
  price: z.number().describe('A suggested price for the item.'),
  quantity: z.number().describe('A suggested quantity for the item.'),
}));
export type SuggestItemsOutput = z.infer<typeof SuggestItemsOutputSchema>;

export async function suggestItems(input: SuggestItemsInput): Promise<SuggestItemsOutput> {
  return suggestItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemsPrompt',
  input: {schema: SuggestItemsInputSchema},
  output: {schema: SuggestItemsOutputSchema},
  prompt: `You are an AI assistant that helps businesses generate documents by suggesting appropriate item descriptions, pricing, and quantities.

You will receive the business type and VAT rate, and you will respond with an array of suggested items.

Business Type: {{{businessType}}}
VAT Rate: {{{vatRate}}}

Respond in JSON format. Each object in the array should contain a description, price, and quantity.
For example:
[{
  "description": "Consulting Services",
  "price": 1000,
  "quantity": 1
}, {
  "description": "Project Management",
  "price": 5000,
  "quantity": 1
}]`,
});

const suggestItemsFlow = ai.defineFlow(
  {
    name: 'suggestItemsFlow',
    inputSchema: SuggestItemsInputSchema,
    outputSchema: SuggestItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
