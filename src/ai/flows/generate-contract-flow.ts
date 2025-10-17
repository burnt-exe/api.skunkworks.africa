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
  contractType: z.enum([
      // Agreements
      'nda', 'employment', 'sales', 'lease', 'partnership', 'service', 'consulting', 
      'licensing', 'franchise', 'settlement', 'loan', 'rental', 'consignment', 'joint_venture',
      // Legal & Compliance
      'terms_of_service', 'privacy_policy', 'disclaimer', 'indemnity', 'waiver',
      // Business & Project Management
      'statement_of_work', 'business_plan', 'swot_analysis', 'project_charter', 'meeting_minutes',
      // HR & Internal
      'offer_letter', 'employee_handbook', 'termination_letter', 'performance_review',
      // Financial
      'promissory_note', 'bill_of_sale', 'investment_agreement'
  ]).describe('The type of contract to generate.'),
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
    const contractLabel = input.contractType.replace(/_/g, ' ');

    // Base prompt
    let basePrompt = `
You are an expert legal and business AI. Generate a standard, legally-sound document for a "${contractLabel}" based on the following details.
The generated text should be in plain text format, well-formatted, and ready to be copied into a document.
Include all standard clauses and sections appropriate for this type of document.
`;

    // Add specific details for NDA
    if (input.contractType === 'nda') {
        basePrompt += `
**NDA-Specific Details:**
- **Disclosing Party**: ${input.disclosingParty || '[Disclosing Party Name]'}
- **Receiving Party**: ${input.receivingParty || '[Receiving Party Name]'}
- **Effective Date**: ${input.effectiveDate || '[Effective Date]'}
- **Term of Confidentiality**: ${input.term || '[Term, e.g., 2 years]'}
- **Purpose of Disclosure**: ${input.purpose || '[Purpose of Disclosure]'}
`;
    }
    
    // In the future, you can add more 'if' blocks here for other contract types
    // that have specific input fields.

    promptText = basePrompt;

    const { text } = await ai.generate({
      prompt: promptText,
      config: {
        temperature: 0.2, // Lower temperature for more deterministic legal/business text
      },
    });
    
    return { contractText: text };
  }
);
