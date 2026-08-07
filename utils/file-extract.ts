/**
 * Extracts plain text from a File object.
 * Supports .txt, .pdf, .doc, and .docx files.
 * All heavy libraries are dynamically imported (client-side only).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  // Plain text
  if (type === "text/plain" || name.endsWith(".txt")) {
    return file.text();
  }

  // PDF
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return extractTextFromPDF(file);
  }

  // Word documents
  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return extractTextFromDocx(file);
  }

  throw new Error(
    "Unsupported file type. Please upload a .txt, .pdf, .doc, or .docx file.",
  );
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  // Use the bundled worker via CDN matching the installed version
  const version = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter(item => "str" in item)
      .map(item => (item as { str: string }).str)
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extracts HTML from a File object, preserving formatting.
 * For DOCX files, uses mammoth's HTML conversion to retain bold, italic, headings, lists, etc.
 * For TXT/PDF files, wraps text lines in <p> tags.
 */
export async function extractHtmlFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  // Plain text — wrap each line in <p>
  if (type === "text/plain" || name.endsWith(".txt")) {
    const text = await file.text();
    return text
      .split("\n")
      .map(line => `<p>${line || "<br>"}</p>`)
      .join("");
  }

  // PDF — no formatting available, wrap text in <p>
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const text = await extractTextFromPDF(file);
    return text
      .split("\n")
      .map(line => `<p>${line || "<br>"}</p>`)
      .join("");
  }

  // Word documents — preserve formatting via mammoth HTML conversion
  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  }

  throw new Error(
    "Unsupported file type. Please upload a .txt, .pdf, .doc, or .docx file.",
  );
}
