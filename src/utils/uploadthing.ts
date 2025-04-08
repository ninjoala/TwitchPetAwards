"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

/**
 * Generates a unique filename for uploaded files
 * @param originalFilename The original file name
 * @returns A unique filename with timestamp and random string
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  // Get file extension
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const extension = lastDotIndex > 0 ? originalFilename.slice(lastDotIndex) : '';
  
  // Get filename without extension
  const nameWithoutExt = lastDotIndex > 0 ? originalFilename.slice(0, lastDotIndex) : originalFilename;
  
  // Clean the filename - remove special characters that could cause issues
  const cleanedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace special chars with underscore
    .substring(0, 30);                // Limit length
  
  // Generate timestamp and random string
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const randomString = Math.random().toString(36).substring(2, 8);
  
  // Create unique filename
  return `${cleanedName}_${timestamp}_${randomString}${extension}`;
}; 