import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const MAX_EXTRACTED_CHARS = 50000;

export class ResumeProcessingError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, message: string, retryable = true) {
    super(message);
    this.name = "ResumeProcessingError";
    this.code = code;
    this.retryable = retryable;
  }
}

function normalizeText(text: string) {
  return text
    .replaceAll("\u0000", "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_EXTRACTED_CHARS);
}

export async function extractResumeText(input: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}) {
  const extension = input.fileName.toLowerCase().split(".").pop();
  let text = "";
  let pageCount: number | null = null;

  try {
    if (input.mimeType === "application/pdf" || extension === "pdf") {
      const parser = new PDFParse({ data: input.buffer });
      try {
        const result = await parser.getText();
        text = result.text;
        pageCount = result.total;
      } finally {
        await parser.destroy();
      }
    } else if (
      input.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === "docx"
    ) {
      const result = await mammoth.extractRawText({ buffer: input.buffer });
      text = result.value;
    } else {
      throw new ResumeProcessingError("UNSUPPORTED_FILE", "Only PDF and DOCX resumes can be analyzed.", false);
    }
  } catch (error) {
    console.error("resume.extraction.error", error);
    if (error instanceof ResumeProcessingError) throw error;
    throw new ResumeProcessingError("EXTRACTION_FAILED", "The resume text could not be extracted.");
  }

  const normalizedText = normalizeText(text);
  if (normalizedText.length < 40) {
    throw new ResumeProcessingError(
      "NO_EXTRACTABLE_TEXT",
      "This resume does not contain enough selectable text to analyze. Scanned images require OCR and are not supported yet.",
      false,
    );
  }

  return {
    text: normalizedText,
    wordCount: normalizedText.split(/\s+/).filter(Boolean).length,
    pageCount,
  };
}
