
'use server';
/**
 * @fileOverview An AI-powered tool to convert various document types (DOCX, XLSX, images) into a PDF file.
 *
 * - convertToPdf - A function that handles the conversion process.
 * - ConvertToPdfInput - The input type for the function.
 * - ConvertToPdfOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { googleAI } from '@genkit-ai/googleai';

const ConvertToPdfInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The source file content as a data URI. Must include a MIME type and use Base64 encoding."
    ),
  sourceType: z.enum(['docx', 'xlsx', 'jpeg', 'png']).describe("The type of the source file."),
});
export type ConvertToPdfInput = z.infer<typeof ConvertToPdfInputSchema>;

const ConvertToPdfOutputSchema = z.object({
  pdfDataUri: z.string().describe('The generated PDF file as a data URI.'),
});
export type ConvertToPdfOutput = z.infer<typeof ConvertToPdfOutputSchema>;

export async function convertToPdf(
  input: ConvertToPdfInput
): Promise<ConvertToPdfOutput> {
  return convertToPdfFlow(input);
}


// A generic schema for content extracted from a document.
const ExtractedContentSchema = z.object({
    content: z.string().describe("The main textual or structural content extracted from the file."),
    sourceType: ConvertToPdfInputSchema.shape.sourceType,
});


// This is the core prompt that converts the extracted content into a PDF.
// Gemini is capable of taking text/html/json and rendering it as a PDF.
const renderPdfPrompt = ai.definePrompt({
  name: 'renderContentToPdfPrompt',
  input: { schema: ExtractedContentSchema },
  output: { format: 'pdf' }, // Request PDF output
  prompt: `
You are an expert document converter. Your task is to render the following content into a professional-looking PDF document.

Retain as much of the original formatting, layout, and structure as possible.
- For HTML or Markdown, render it visually.
- For CSV data, format it into a clean, readable table.
- For plain text, format it into paragraphs.

Content to convert:
'''
{{{content}}}
'''
`,
  config: {
    temperature: 0.0,
    // Note: The 'pdf' output format is a powerful feature of Gemini
    // that handles the complex rendering from structured text to a PDF file.
  },
  models: [googleAI.model('gemini-1.5-pro-latest')], // Use a model known for strong document understanding
});


const convertToPdfFlow = ai.defineFlow(
  {
    name: 'convertToPdfFlow',
    inputSchema: ConvertToPdfInputSchema,
    outputSchema: ConvertToPdfOutputSchema,
  },
  async (input) => {
    let extractedContent: string = '';

    const buffer = Buffer.from(
      input.fileDataUri.substring(input.fileDataUri.indexOf(',') + 1),
      'base64'
    );

    // Step 1: Extract content based on the source file type
    switch (input.sourceType) {
      case 'docx':
        // Mammoth converts DOCX to HTML, which Gemini can render nicely.
        const { value: html } = await mammoth.convertToHtml({ buffer });
        extractedContent = html;
        break;
      case 'xlsx':
        // Convert the first sheet of an Excel file to CSV format.
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        extractedContent = XLSX.utils.sheet_to_csv(worksheet);
        break;
      case 'jpeg':
      case 'png':
        // For images, we just pass the data URI to the model.
        // The prompt will instruct it on how to handle it.
         const { media } = await ai.generate({
            model: googleAI.model('gemini-1.5-pro-latest'),
            prompt: [
                { media: { url: input.fileDataUri, contentType: input.sourceType === 'jpeg' ? 'image/jpeg' : 'image/png' } },
                { text: 'Create a PDF document containing this image. The image should fill the page while maintaining its aspect ratio.'}
            ],
            output: { format: 'pdf'}
         });
         if (!media?.url) {
            throw new Error('Failed to generate PDF from image.');
         }
         return { pdfDataUri: media.url };
    }

    // Step 2: Render the extracted content into a PDF using Gemini
    const { output: pdfOutput } = await renderPdfPrompt({
      content: extractedContent,
      sourceType: input.sourceType,
    });
    
    if (!pdfOutput) {
        throw new Error('AI failed to generate the PDF file.');
    }
    
    const pdfDataUri = pdfOutput.toString(); // The model output is the data URI string.
    
    return { pdfDataUri };
  }
);
