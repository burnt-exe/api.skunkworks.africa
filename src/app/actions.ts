'use server';

import { suggestItems, type SuggestItemsInput } from '@/ai/flows/suggest-items';

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
