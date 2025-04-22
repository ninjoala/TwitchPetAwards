"use server";
import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

// Cache metadata for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedMetadata: MetadataContent[] | null = null;
let lastFetchTime = 0;

interface FileInfo {
  name: string;
  url: string;
  uploadedAt: string;
  key: string;
  id: string;
  status: "Uploaded" | "Uploading" | "Failed" | "Deletion Pending";
}

export interface MetadataContent {
  name: string;
  email: string;
  description: string;
  submittedAt: string;
  associatedVideo: string;
  videoTitle: string;
  videoUrl?: string;
  fileInfo: FileInfo;
  uploadMethod: UploadType;
  isAdopted: boolean;
}

enum UploadType {
  link,
  file
}

export async function GET() : Promise<NextResponse<MetadataContent[]> | NextResponse<{ error: string; }>> {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedMetadata && (now - lastFetchTime) < CACHE_DURATION) {
      return NextResponse.json(cachedMetadata);
    }

    const { files } = await utapi.listFiles();
    
    if (!files || !Array.isArray(files)) {
      throw new Error('Invalid response from UploadThing API');
    }

    // Filter only metadata files and map to FileInfo structure
    const metadataFiles = files
      .map(file => ({
        name: file.name,
        url: `https://utfs.io/f/${file.key}`,
        uploadedAt: new Date(file.uploadedAt).toISOString(),
        key: file.key,
        id: file.id,
        status: "Uploaded" as const
      }));

    // Fetch and parse metadata for each file in parallel
    const metadataPromises = metadataFiles.map(async (file) => {
      try {
        
        // Only include videoUrl if it exists
        const processedMetadata = {
          fileInfo: file,
        };
      
        
        return processedMetadata;
      } catch (error) {
        console.error(`Error processing metadata file ${file.name}:`, error);
        return null;
      }
    });

    const metadataContents = (await Promise.all(metadataPromises)).filter(Boolean) as MetadataContent[];
    
    // Update cache
    cachedMetadata = metadataContents;
    lastFetchTime = now;

    return NextResponse.json(metadataContents);
  } catch (error) {
    console.error('Error in list-metadata route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
} 