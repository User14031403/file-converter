import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";
import archiver from "archiver";
import { Extract } from "unzipper";
import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import { promisify } from "util";
import { pipeline as streamPipeline } from "stream";

const pipeline = promisify(streamPipeline);

/**
 * Image Conversion Service
 */
export async function convertImage(
  inputBuffer: Buffer,
  fromFormat: string,
  toFormat: string
): Promise<Buffer> {
  let image = sharp(inputBuffer);

  // Handle format-specific conversions
  if (toFormat.toLowerCase() === "jpeg" || toFormat.toLowerCase() === "jpg") {
    return image.jpeg({ quality: 90 }).toBuffer();
  } else if (toFormat.toLowerCase() === "png") {
    return image.png({ quality: 90 }).toBuffer();
  } else if (toFormat.toLowerCase() === "svg") {
    // For SVG, we'll convert to PNG first and provide guidance
    // Full SVG tracing would require additional libraries
    return image.png({ quality: 90 }).toBuffer();
  }

  return inputBuffer;
}

/**
 * Document Conversion Service
 */
export async function convertDocument(
  inputBuffer: Buffer,
  fromFormat: string,
  toFormat: string
): Promise<Buffer> {
  const from = fromFormat.toLowerCase();
  const to = toFormat.toLowerCase();

  // For now, we'll provide basic PDF handling
  // Full DOCX to PDF conversion would require additional libraries
  if ((from === "docx" || from === "doc") && to === "pdf") {
    // Placeholder: In production, use libreoffice or similar
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    page.drawText("Document conversion placeholder", { x: 50, y: 750 });
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  if (from === "pdf" && (to === "docx" || to === "doc")) {
    // Placeholder: PDF to DOCX conversion
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun("PDF to DOCX conversion placeholder"),
              ],
            }),
          ],
        },
      ],
    });
    return Packer.toBuffer(doc);
  }

  return inputBuffer;
}

/**
 * Audio Conversion Service
 */
export async function convertAudio(
  inputBuffer: Buffer,
  fromFormat: string,
  toFormat: string,
  tempDir: string
): Promise<Buffer> {
  const from = fromFormat.toLowerCase();
  const to = toFormat.toLowerCase();

  // For now, return the input buffer as-is
  // Full audio conversion would require ffmpeg
  if (from === to) {
    return inputBuffer;
  }

  // Placeholder for audio conversion
  return inputBuffer;
}

/**
 * Video Conversion Service
 */
export async function convertVideo(
  inputBuffer: Buffer,
  fromFormat: string,
  toFormat: string,
  tempDir: string
): Promise<Buffer> {
  const from = fromFormat.toLowerCase();
  const to = toFormat.toLowerCase();

  // For now, return the input buffer as-is
  // Full video conversion would require ffmpeg
  if (from === to) {
    return inputBuffer;
  }

  // Placeholder for video conversion
  return inputBuffer;
}

/**
 * Archive Service - Compress files
 */
export async function compressFiles(
  files: Array<{ name: string; buffer: Buffer }>,
  tempDir: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

  archive.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

    archive.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on("error", reject);

    // Add files to archive
    for (const file of files) {
      archive.append(file.buffer, { name: file.name });
    }

    archive.finalize();
  });
}

/**
 * Archive Service - Decompress files
 */
export async function decompressFiles(
  inputBuffer: Buffer,
  tempDir: string
): Promise<Array<{ name: string; buffer: Buffer }>> {
  const files: Array<{ name: string; buffer: Buffer }> = [];
  const tempFile = path.join(tempDir, `temp-${Date.now()}.zip`);

  try {
    // Write buffer to temp file
    fs.writeFileSync(tempFile, inputBuffer);

    // Extract files
    return new Promise((resolve, reject) => {
      createReadStream(tempFile)
        .pipe(Extract({ path: tempDir }))
        .on("entry", (entry: any) => {
          const chunks: Buffer[] = [];

          entry.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });

          entry.on("end", () => {
            if (!entry.isDirectory) {
              files.push({
                name: entry.path,
                buffer: Buffer.concat(chunks),
              });
            }
          });

          entry.on("error", reject);
        })
        .on("close", () => {
          // Clean up temp file
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // Ignore cleanup errors
          }
          resolve(files);
        })
        .on("error", reject);
    });
  } catch (error) {
    // Clean up on error
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Main conversion router
 */
export async function convertFile(
  inputBuffer: Buffer,
  fileType: string,
  fromFormat: string,
  toFormat: string,
  tempDir: string
): Promise<Buffer> {
  const type = fileType.toLowerCase();

  switch (type) {
    case "image":
      return convertImage(inputBuffer, fromFormat, toFormat);
    case "document":
      return convertDocument(inputBuffer, fromFormat, toFormat);
    case "audio":
      return convertAudio(inputBuffer, fromFormat, toFormat, tempDir);
    case "video":
      return convertVideo(inputBuffer, fromFormat, toFormat, tempDir);
    case "archive":
      // For archive type, we expect compression
      if (toFormat.toLowerCase() === "zip") {
        return compressFiles([{ name: "file", buffer: inputBuffer }], tempDir);
      }
      return inputBuffer;
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}
