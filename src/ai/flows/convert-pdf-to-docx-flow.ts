
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
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

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


// Schema for the structured content extracted from the PDF
const DocumentContentSchema = z.object({
    blocks: z.array(z.object({
        type: z.enum(["heading1", "heading2", "heading3", "paragraph", "bullet"]),
        content: z.string(),
    }))
});

const extractContentPrompt = ai.definePrompt({
    name: "extractStructuredContentFromPdfPrompt",
    input: { schema: ConvertPdfToDocxInputSchema },
    output: { schema: DocumentContentSchema },
    prompt: `
You are an expert document analyst. Your task is to analyze the content of the provided PDF and convert it into a structured JSON format.

Identify the semantic structure of the document. Recognize headings (H1, H2, H3), paragraphs, and bullet points.

- For headings, use "heading1", "heading2", or "heading3".
- For standard text, use "paragraph".
- For list items, use "bullet".

The output must be a JSON object with a single key "blocks", which is an array of objects. Each object in the array must have a "type" and a "content" field.

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
    // 1. Extract structured content using the AI model
    const { output } = await extractContentPrompt(input);
    if (!output?.blocks) {
        throw new Error("AI failed to extract structured content from the PDF.");
    }

    // 2. Build the DOCX document from the structured content
    const docChildren = output.blocks.map(block => {
        switch (block.type) {
            case "heading1":
                return new Paragraph({ text: block.content, heading: HeadingLevel.HEADING_1 });
            case "heading2":
                return new Paragraph({ text: block.content, heading: HeadingLevel.HEADING_2 });
            case "heading3":
                return new Paragraph({ text: block.content, heading: HeadingLevel.HEADING_3 });
            case "bullet":
                 return new Paragraph({ text: block.content, bullet: { level: 0 } });
            case "paragraph":
            default:
                return new Paragraph({ children: [new TextRun(block.content)] });
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: docChildren,
        }],
    });

    // 3. Pack the document into a buffer and convert to base64
    const buffer = await Packer.toBuffer(doc);
    const base64String = buffer.toString('base64');
    
    const docxDataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64String}`;

    return { docxDataUri };
  }
);
