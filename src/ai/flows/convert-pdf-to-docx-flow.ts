
'use server';
/**
 * @fileOverview An AI-powered tool to convert a PDF document into a DOCX file.
 *
 * - convertPdfToDocx - A function that handles the conversion process.
 * - ConvertPdfToDocxInput - The input type for the function.
 * - ConvertPdfToDocxOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Document, Packer, Paragraph } from "docx";

const ConvertPdfToDocxInputSchema = z.object({
  pdfDataUri: z.string().describe("The PDF file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type ConvertPdfToDocxInput = z.infer<typeof ConvertPdfToDocxInputSchema>;

const ConvertPdfToDocxOutputSchema = z.object({
  docxDataUri: z.string().describe("The generated DOCX file as a data URI."),
});
export type ConvertPdfToDocxOutput = z.infer<typeof ConvertPdfToDocxOutputSchema>;

export async function convertPdfToDocx(input: ConvertPdfToDocxInput): Promise<ConvertPdfToDocxOutput> {
  return convertPdfToDocxFlow(input);
}

const extractTextPrompt = ai.definePrompt({
    name: "extractTextFromPdfPrompt",
    input: { schema: ConvertPdfToDocxInputSchema },
    output: { schema: z.object({ text: z.string() }) },
    prompt: `Extract all text content from the provided PDF document. Preserve paragraph breaks where possible.
    PDF: {{media url=pdfDataUri}}`,
    config: {
        temperature: 0.1,
    }
});


const convertPdfToDocxFlow = ai.defineFlow(
  {
    name: 'convertPdfToDocxFlow',
    inputSchema: ConvertPdfToDocxInputSchema,
    outputSchema: ConvertPdfToDocxOutputSchema,
  },
  async (input) => {
    // 1. Extract text using the AI model
    const { output } = await extractTextPrompt(input);
    if (!output?.text) {
        throw new Error("AI failed to extract text from the PDF.");
    }
    const paragraphs = output.text.split('\n').map(p => new Paragraph({ text: p }));

    // 2. Create a DOCX document
    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    // 3. Pack the document into a buffer and convert to base64
    const buffer = await Packer.toBuffer(doc);
    const base64String = buffer.toString('base64');
    
    const docxDataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64String}`;

    return { docxDataUri };
  }
);
