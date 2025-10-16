declare module 'pdf-parse/lib/pdf-parse' {
    const pdf: (dataBuffer: ArrayBuffer | Buffer) => Promise<{ text: string }>;
    export default pdf;
  }
  