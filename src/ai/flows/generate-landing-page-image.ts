'use server';
/**
 * @fileOverview An AI-powered tool that generates a background image for the landing page based on a user-provided prompt.
 *
 * - generateLandingPageImage - A function that handles the image generation process.
 * - GenerateLandingPageImageInput - The input type for the generateLandingPageImage function.
 * - GenerateLandingPageImageOutput - The return type for the generateLandingPageImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLandingPageImageInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt to generate the image from.'),
});
export type GenerateLandingPageImageInput = z.infer<typeof GenerateLandingPageImageInputSchema>;

const GenerateLandingPageImageOutputSchema = z.object({
    imageUrl: z.string().describe("The data URI of the generated image. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateLandingPageImageOutput = z.infer<typeof GenerateLandingPageImageOutputSchema>;

export async function generateLandingPageImage(input: GenerateLandingPageImageInput): Promise<GenerateLandingPageImageOutput> {
  return generateLandingPageImageFlow(input);
}

const generateLandingPageImageFlow = ai.defineFlow(
  {
    name: 'generateLandingPageImageFlow',
    inputSchema: GenerateLandingPageImageInputSchema,
    outputSchema: GenerateLandingPageImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A stunning, photorealistic, high-resolution background image for a website. Scene: ${input.prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed to produce an image.');
    }

    return { imageUrl: media.url };
  }
);
