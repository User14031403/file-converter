import { describe, it, expect } from "vitest";
import { convertImage, convertFile } from "./converters";
import sharp from "sharp";

describe("File Converters", () => {
  describe("convertImage", () => {
    it("should convert PNG to JPEG", async () => {
      // Create a simple test PNG buffer
      const pngBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const result = await convertImage(pngBuffer, "png", "jpeg");

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should convert PNG to PNG", async () => {
      const pngBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 0, g: 255, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const result = await convertImage(pngBuffer, "png", "png");

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should convert JPEG to PNG", async () => {
      const jpegBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 0, g: 0, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await convertImage(jpegBuffer, "jpeg", "png");

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("convertFile", () => {
    it("should handle image conversion", async () => {
      const pngBuffer = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const result = await convertFile(
        pngBuffer,
        "image",
        "png",
        "jpeg",
        "/tmp"
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should throw error for unsupported file type", async () => {
      const buffer = Buffer.from("test");

      try {
        await convertFile(buffer, "unknown", "txt", "pdf", "/tmp");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain("Unsupported file type");
      }
    });

    it("should handle document conversion", async () => {
      const buffer = Buffer.from("test document");

      const result = await convertFile(
        buffer,
        "document",
        "pdf",
        "docx",
        "/tmp"
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("should handle audio conversion", async () => {
      const buffer = Buffer.from("test audio");

      const result = await convertFile(
        buffer,
        "audio",
        "mp3",
        "wav",
        "/tmp"
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("should handle video conversion", async () => {
      const buffer = Buffer.from("test video");

      const result = await convertFile(
        buffer,
        "video",
        "mp4",
        "mov",
        "/tmp"
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("should handle archive conversion", async () => {
      const buffer = Buffer.from("test archive");

      const result = await convertFile(
        buffer,
        "archive",
        "zip",
        "zip",
        "/tmp"
      );

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
