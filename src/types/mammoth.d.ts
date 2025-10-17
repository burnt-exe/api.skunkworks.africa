
declare module 'mammoth' {
    export interface MammothOptions {
      styleMap?: string[];
      includeDefaultStyles?: boolean;
      convertImage?: any; // You might want to type this more strictly
      ignoreEmptyParagraphs?: boolean;
      idPrefix?: string;
      transformDocument?: (element: any) => any;
    }
  
    export interface MammothResult {
      value: string; // The generated HTML
      messages: Array<{
        type: 'warning' | 'error';
        message: string;
        error?: Error;
      }>;
    }
  
    export function convertToHtml(
      input: { path: string } | { buffer: Buffer },
      options?: MammothOptions
    ): Promise<MammothResult>;
  
    // Add other functions if you use them, e.g., convertToMarkdown
  }
  