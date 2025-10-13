
'use server';

import {
  suggestItems,
  type SuggestItemsInput,
} from '@/ai/flows/suggest-items';
import {
  generateLandingPageImage,
  type GenerateLandingPageImageInput,
} from '@/ai/flows/generate-landing-page-image';
import {
  convertBankStatement,
  type ConvertBankStatementInput,
} from '@/ai/flows/convert-bank-statement-flow';
import {
  convertPdfToDocx,
  type ConvertPdfToDocxInput,
} from '@/ai/flows/convert-pdf-to-docx-flow';

/**
 * Standardized server action response shape.
 */
interface ServerActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Unified error handler — ensures consistent logs & messages.
 */
function handleActionError(context: string, error: unknown): ServerActionResponse<never> {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'An unknown error occurred.';

  console.error(`[${context}]`, error);
  return { success: false, error: `${context}: ${message}` };
}

/**
 * Suggest AI-driven item recommendations based on input criteria.
 */
export async function suggestItemsAction(
  input: SuggestItemsInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof suggestItems>>>> {
  try {
    const data = await suggestItems(input);
    return { success: true, data };
  } catch (error) {
    return handleActionError('Failed to get suggestions', error);
  }
}

/**
 * Generate AI-powered landing page imagery (marketing visuals, banners, etc.).
 */
export async function generateLandingPageImageAction(
  input: GenerateLandingPageImageInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof generateLandingPageImage>>>> {
  try {
    const data = await generateLandingPageImage(input);
    return { success: true, data };
  } catch (error) {
    return handleActionError('Failed to generate image', error);
  }
}

/**
 * Convert uploaded bank statement PDFs into structured financial data.
 */
export async function convertBankStatementAction(
  input: ConvertBankStatementInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertBankStatement>>>> {
  try {
    const data = await convertBankStatement(input);
    return { success: true, data };
  } catch (error) {
    return handleActionError('Error during bank statement conversion', error);
  }
}

/**
 * Converts an uploaded PDF file to a DOCX document.
 */
export async function convertPdfToDocxAction(
  input: ConvertPdfToDocxInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertPdfToDocx>>>> {
  try {
    const data = await convertPdfToDocx(input);
    return { success: true, data };
  } catch (error) {
    return handleActionError('Error during PDF to DOCX conversion', error);
  }
}
