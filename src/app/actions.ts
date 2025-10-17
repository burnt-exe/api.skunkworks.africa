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
  convertPdfToDocx,
  type ConvertPdfToDocxInput,
} from '@/ai/flows/convert-pdf-to-docx-flow';
import {
  convertPdfToXlsx,
  type ConvertPdfToXlsxInput,
} from '@/ai/flows/convert-pdf-to-xlsx-flow';
import {
  convertPdfToImage,
  type ConvertPdfToImageInput,
} from '@/ai/flows/convert-pdf-to-image-flow';
import {
  convertToXlsx,
  type ConvertToXlsxInput,
} from '@/ai/flows/convert-to-xlsx-flow';
import type { DocumentData } from '@/types';

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
  businessType: z.string().min(1, 'Business type is required'),
  vatRate: z.number(),
});

const GenerateLandingPageImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

const PdfInputSchema = z.object({
  pdfDataUri: z.string().url('Valid data URI required'),
});

const ConvertToXlsxSchema = z.custom<DocumentData>();

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
): Promise<
  ServerActionResponse<Awaited<ReturnType<typeof generateLandingPageImage>>>
> {
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
 * Converts an uploaded PDF file to a DOCX document.
 */
export async function convertPdfToDocxAction(
  input: ConvertPdfToDocxInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertPdfToDocx>>>> {
  const traceId = randomUUID();
  try {
    PdfInputSchema.parse(input);
    const data = await convertPdfToDocx(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Error during PDF to DOCX conversion', error, traceId);
  }
}

/**
 * Converts an uploaded PDF file to an XLSX document.
 */
export async function convertPdfToXlsxAction(
  input: ConvertPdfToXlsxInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertPdfToXlsx>>>> {
  const traceId = randomUUID();
  try {
    PdfInputSchema.parse(input);
    const data = await convertPdfToXlsx(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Error during PDF to XLSX conversion', error, traceId);
  }
}

/**
 * Converts an uploaded PDF file to a JPG image.
 */
export async function convertPdfToImageAction(
  input: ConvertPdfToImageInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertPdfToImage>>>> {
  const traceId = randomUUID();
  try {
    PdfInputSchema.parse(input);
    const data = await convertPdfToImage(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Error during PDF to Image conversion', error, traceId);
  }
}

/**
 * Converts document data to an XLSX file.
 */
export async function convertToXlsxAction(
  input: ConvertToXlsxInput,
): Promise<ServerActionResponse<Awaited<ReturnType<typeof convertToXlsx>>>> {
  const traceId = randomUUID();
  try {
    ConvertToXlsxSchema.parse(input);
    const data = await convertToXlsx(input);
    return ok(data, traceId);
  } catch (error) {
    return handleActionError('Error during XLSX conversion', error, traceId);
  }
}
