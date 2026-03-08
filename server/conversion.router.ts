import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createConversion,
  getUserConversions,
  getConversionById,
  updateConversionStatus,
  deleteConversion,
} from "./db";
import { convertFile } from "./converters";
import { storagePut, storageGet } from "./storage";
import fs from "fs";
import path from "path";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "file-converter");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// File type detection
const FILE_TYPES: Record<string, string> = {
  // Documents
  docx: "document",
  doc: "document",
  pdf: "document",
  // Images
  jpeg: "image",
  jpg: "image",
  png: "image",
  svg: "image",
  // Audio
  mp3: "audio",
  wav: "audio",
  // Video
  mp4: "video",
  mov: "video",
  // Archive
  zip: "archive",
};

function getFileType(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return FILE_TYPES[ext] || null;
}

export const conversionRouter = router({
  /**
   * Convert a file
   */
  convert: publicProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileBuffer: z.instanceof(Buffer),
        outputFormat: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { fileName, fileBuffer, outputFormat } = input;

        // Detect file type
        const fileType = getFileType(fileName);
        if (!fileType) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unsupported file type",
          });
        }

        // Get input format
        const inputFormat = fileName.split(".").pop()?.toLowerCase() || "";

        // Validate file size (max 500MB)
        const MAX_FILE_SIZE = 500 * 1024 * 1024;
        if (fileBuffer.length > MAX_FILE_SIZE) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size exceeds 500MB limit",
          });
        }

        // Create conversion record if user is authenticated
        let conversionId: number | null = null;
        if (ctx.user) {
          const conversion = await createConversion({
            userId: ctx.user.id,
            originalFileName: fileName,
            originalFormat: inputFormat,
            outputFormat: outputFormat,
            fileType: fileType,
            originalFileSize: fileBuffer.length,
            status: "processing",
          });
          conversionId = conversion.id;
        }

        try {
          // Perform conversion
          const startTime = Date.now();
          const convertedBuffer = await convertFile(
            fileBuffer,
            fileType,
            inputFormat,
            outputFormat,
            TEMP_DIR
          );
          const processingTimeMs = Date.now() - startTime;

          // Upload converted file to storage
          const outputFileName = `${fileName.split(".")[0]}.${outputFormat}`;
          const fileKey = `conversions/${Date.now()}-${Math.random().toString(36).substring(7)}-${outputFileName}`;
          const { url: downloadUrl } = await storagePut(
            fileKey,
            convertedBuffer,
            "application/octet-stream"
          );

          // Update conversion record if user is authenticated
          if (conversionId && ctx.user) {
            await updateConversionStatus(conversionId, "completed", {
              convertedFileSize: convertedBuffer.length,
              convertedFileUrl: downloadUrl,
              processingTimeMs,
            });
          }

          return {
            success: true,
            downloadUrl,
            fileName: outputFileName,
            fileSize: convertedBuffer.length,
            processingTimeMs,
            conversionId,
          };
        } catch (error) {
          // Update conversion record with error if user is authenticated
          if (conversionId && ctx.user) {
            await updateConversionStatus(conversionId, "failed", {
              errorMessage:
                error instanceof Error ? error.message : "Unknown error",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Conversion failed",
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Conversion failed",
        });
      }
    }),

  /**
   * Get user's conversion history
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const conversions = await getUserConversions(ctx.user.id, input?.limit || 50);
      return conversions;
    }),

  /**
   * Get a specific conversion
   */
  getConversion: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const conversion = await getConversionById(input.id);
      if (!conversion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversion not found",
        });
      }

      // Verify ownership
      if (conversion.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this conversion",
        });
      }

      return conversion;
    }),

  /**
   * Delete a conversion
   */
  deleteConversion: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const conversion = await getConversionById(input.id);
      if (!conversion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversion not found",
        });
      }

      // Verify ownership
      if (conversion.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this conversion",
        });
      }

      await deleteConversion(input.id);
      return { success: true };
    }),

  /**
   * Get download URL for a conversion
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const conversion = await getConversionById(input.id);
      if (!conversion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversion not found",
        });
      }

      // Verify ownership
      if (conversion.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this conversion",
        });
      }

      if (!conversion.convertedFileUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conversion file not available",
        });
      }

      // Return the converted file URL
      return { url: conversion.convertedFileUrl };
    }),
});
