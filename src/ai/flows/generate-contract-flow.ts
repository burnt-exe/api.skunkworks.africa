
'use server';
/**
 * @fileOverview An AI-powered tool for generating legal contracts.
 *
 * - generateContract - A function that handles the contract generation.
 * - GenerateContractInput - The input type for the function.
 * - GenerateContractOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateContractInputSchema = z.object({
  contractType: z.enum(['nda', 'employment', 'sales']).describe('The type of contract to generate.'),
  disclosingParty: z.string().optional().describe('The name of the party disclosing information (for NDA).'),
  receivingParty: z.string().optional().describe('The name of the party receiving information (for NDA).'),
  effectiveDate: z.string().optional().describe('The effective date of the agreement.'),
  term: z.string().optional().describe('The duration of the agreement (e.g., "2 years").'),
  purpose: z.string().optional().describe('The purpose of the information exchange (for NDA).'),
  // Add more fields for other contract types here
});
export type GenerateContractInput = z.infer<typeof GenerateContractInputSchema>;

const GenerateContractOutputSchema = z.object({
  contractText: z.string().describe('The full text of the generated legal contract.'),
});
export type GenerateContractOutput = z.infer<typeof GenerateContractOutputSchema>;

export async function generateContract(input: GenerateContractInput): Promise<GenerateContractOutput> {
  return generateContractFlow(input);
}


const generateContractFlow = ai.defineFlow(
  {
    name: 'generateContractFlow',
    inputSchema: GenerateContractInputSchema,
    outputSchema: GenerateContractOutputSchema,
  },
  async (input) => {
    let promptText = '';

    // Construct the prompt based on the contract type
    switch (input.contractType) {
      case 'nda':
        promptText = `
You are an expert legal AI. Generate a standard, legally sound Non-Disclosure Agreement (NDA) based on the following details.
The generated text should be in plain text format, well-formatted, and ready to be copied into a document.

- **Disclosing Party**: ${input.disclosingParty}
- **Receiving Party**: ${input.receivingParty}
- **Effective Date**: ${input.effectiveDate}
- **Term of Confidentiality**: ${input.term}
- **Purpose of Disclosure**: ${input.purpose}

Generate the full NDA document including all standard clauses such as definition of confidential information, obligations of the receiving party, exclusions, and governing law.
`;
        break;
      // Add cases for other contract types here in the future
      default:
        throw new Error(`Unsupported contract type: ${input.contractType}`);
    }

    const { text } = await ai.generate({
      prompt: promptText,
      config: {
        temperature: 0.2, // Lower temperature for more deterministic legal text
      },
    });
    
    return { contractText: text };
  }
);
