'use server';

import { randomUUID } from 'crypto';
import { z } from 'zod';

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

/* -------------------------------------------------------------------------- */
/*                            Standard Response Type                          */
/* -------------------------------------------------------------------------- */
interface ServerActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  traceId?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Helper Utils                                */
/* -------------------------------------------------------------------------- */
function ok<T>(data: T, traceId: string): ServerActionResponse<T> {
  return { success: true, data, traceId };
}

function handleActionError(
  context: string,
  error: unknown,
  traceId: string,
): ServerActionResponse<never> {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'An unknown error occurred.';

  console.error(
    JSON.stringify({
      level: 'error',
      context,
      message,
      traceId,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    }),
  );

  return { success: false, error: `${context}: ${message}`, traceId };
}

/* -------------------------------------------------------------------------- */
/*                               Zod Schemas                                  */
/* -------------------------------------------------------------------------- */
const SuggestItemsSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  limit: z.number().optional(),
});

const GenerateLandingPageImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  size: z.string().optional(),
});

const ConvertBankStatementSchema = z.object({
  fileUrl: z.string().url('Valid file URL required'),
  format: z.enum(['csv', 'json', 'xlsx']).optional(),
});

const ConvertPdfToDocxSchema = z.object({
  fileUrl: z.string().url('Valid file URL required'),
  retainImages: z.boolean().optional(),
});

/* -------------------------------------------------------------------------- */
/*                                Server Actions                              */
/* -------------------------------------------------------------------------- */

/**
 * Suggest AI-driven item recommendations based on input criteria.
 */
export async function suggestItemsAction(
  input: SuggestItemsInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof suggestItems>>>> {
  const traceId = randomUUID();
  try {
    SuggestItemsSchema.parse(input);
    const data = await suggestItems(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Failed to get suggestions', error, traceId);
  }
}

/**
 * Generate AI-powered landing page imagery (marketing visuals, banners, etc.).
 */
export async function generateLandingPageImageAction(
  input: GenerateLandingPageImageInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof generateLandingPageImage>>>> {
  const traceId = randomUUID();
  try {
    GenerateLandingPageImageSchema.parse(input);
    const data = await generateLandingPageImage(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Failed to generate image', error, traceId);
  }
}

/**
 * Convert uploaded bank statement PDFs into structured financial data.
 */
export async function convertBankStatementAction(
  input: ConvertBankStatementInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertBankStatement>>>> {
  const traceId = randomUUID();
  try {
    ConvertBankStatementSchema.parse(input);
    const data = await convertBankStatement(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Error during bank statement conversion', error, traceId);
  }
}

/**
 * Converts an uploaded PDF file to a DOCX document.
 */
export async function convertPdfToDocxAction(
  input: ConvertPdfToDocxInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertPdfToDocx>>>> {
  const traceId = randomUUID();
  try {
    ConvertPdfToDocxSchema.parse(input);
    const data = await convertPdfToDocx(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Error during PDF to DOCX conversion', error, traceId);
  }
}
