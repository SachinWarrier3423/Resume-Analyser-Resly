import pdfParse from "pdf-parse";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface ParseResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * Parse PDF file buffer to extract text content
 * Normalizes whitespace and removes excessive line breaks
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  try {
    const data = await pdfParse(buffer);

    // Normalize text: collapse multiple spaces, normalize line breaks
    const normalizedText = data.text
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines
      .trim();

    if (normalizedText.length < 100) {
      throw new Error("PDF appears to be empty or unreadable");
    }

    return {
      text: normalizedText,
      pageCount: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
    throw new Error("PDF parsing failed: Unknown error");
  }
}

/**
 * Extract text from PDF file (for file uploads)
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await parsePdf(buffer);
  return result.text;
}

