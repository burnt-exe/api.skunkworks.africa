'use server';

import { suggestItems, type SuggestItemsInput } from '@/ai/flows/suggest-items';
import { generateLandingPageImage, type GenerateLandingPageImageInput } from '@/ai/flows/generate-landing-page-image';
import { convertBankStatement, type ConvertBankStatementInput } from '@/ai/flows/convert-bank-statement-flow';

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

export async function convertBankStatementAction(input: ConvertBankStatementInput) {
    try {
        const result = await convertBankStatement(input);
        return { success: true, data: result };
    } catch(error) {
        console.error('Error during bank statement conversion:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during conversion.';
        return { success: false, error: errorMessage };
    }
}
