'use server';

import { suggestItems, type SuggestItemsInput } from '@/ai/flows/suggest-items';
import { generateLandingPageImage, type GenerateLandingPageImageInput } from '@/ai/flows/generate-landing-page-image';
import { convertBankStatement, type ConvertBankStatementInput } from '@/ai/flows/convert-bank-statement-flow';
import pdf from 'pdf-parse';

export async function suggestItemsAction(input: SuggestItemsInput) {
  try {
    const suggestions = await suggestItems(input);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to get suggestions: ${errorMessage}` };
  }
}

export async function generateLandingPageImageAction(input: GenerateLandingPageImageInput) {
    try {
        const result = await generateLandingPageImage(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to generate image: ${errorMessage}` };
    }
}

export async function convertBankStatementAction(formData: FormData) {
    const file = formData.get('pdf-file') as File | null;

    if (!file) {
        return { success: false, error: 'No file uploaded.' };
    }
    if (file.type !== 'application/pdf') {
        return { success: false, error: 'Invalid file type. Please upload a PDF.'}
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdf(buffer);
        const textContent = pdfData.text;

        const result = await convertBankStatement({ textContent });
        return { success: true, data: result };
    } catch(error) {
        console.error('Error during bank statement conversion:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during conversion.';
        return { success: false, error: errorMessage };
    }
}
