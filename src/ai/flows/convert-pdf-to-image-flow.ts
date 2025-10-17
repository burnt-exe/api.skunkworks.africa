'use server';
/**
 * @fileOverview An AI-powered tool to convert a PDF document into a JPEG image.
 *
 * - convertPdfToImage - A function that handles the conversion process.
 * - ConvertPdfToImageInput - The input type for the function.
 * - ConvertPdfToImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConvertPdfToImageInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ConvertPdfToImageInput = z.infer<
  typeof ConvertPdfToImageInputSchema
>;

const ConvertPdfToImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated JPEG image as a data URI.'),
});
export type ConvertPdfToImageOutput = z.infer<
  typeof ConvertPdfToImageOutputSchema
>;

export async function convertPdfToImage(
  input: ConvertPdfToImageInput
): Promise<ConvertPdfToImageOutput> {
  return convertPdfToImageFlow(input);
}

const convertPdfToImageFlow = ai.defineFlow(
  {
    name: 'convertPdfToImageFlow',
    inputSchema: ConvertPdfToImageInputSchema,
    outputSchema: ConvertPdfToImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          media: {
            url: input.pdfDataUri,
          },
        },
        { text: 'Render the first page of this PDF as a high-quality JPEG image.' },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce an image.');
    }

    return { imageDataUri: media.url };
  }
);
