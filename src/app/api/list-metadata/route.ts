"use server";
import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

interface FileInfo {
  name: string;
  url: string;
  uploadedAt: string;
  key: string;
  id: string;
  status: "Uploaded" | "Uploading" | "Failed" | "Deletion Pending";
}

interface MetadataContent {
  name: string;
  email: string;
  description: string;
  submittedAt: string;
  associatedVideo: string;
  videoTitle: string;
  videoUrl?: string;
  fileInfo: FileInfo;
  uploadMethod: UploadType;
}

enum UploadType {
  link,
  file
}

export async function GET() {
  try {
    const { files } = await utapi.listFiles();
    
    if (!files || !Array.isArray(files)) {
      throw new Error('Invalid response from UploadThing API');
    }

    // Create a map of video filenames to their URLs
    const videoMap = new Map(
      files
        .filter(file => file && file.name && (file.name.endsWith('.mp4') || file.name.endsWith('.webm')))
        .map(file => [file.name, `https://utfs.io/f/${file.key}`])
    );

    // Filter only metadata files and map to FileInfo structure
    const metadataFiles = files
      .filter(file => file && file.name && file.name.endsWith('.metadata.json'))
      .map(file => ({
        name: file.name,
        url: `https://utfs.io/f/${file.key}`,
        uploadedAt: new Date(file.uploadedAt).toISOString(),
        key: file.key,
        id: file.id,
        status: "Uploaded" as const
      }));

    // Fetch and parse metadata for each file
    const metadataContents: MetadataContent[] = [];
    
    for (const file of metadataFiles) {
      try {
        const response = await fetch(file.url);
        if (!response.ok) continue;
        
        const metadata = await response.json();
        const videoUrl = videoMap.get(metadata.associatedVideo);
        
        metadataContents.push({
          ...metadata,
          fileInfo: file,
          videoUrl,
          uploadMethod: metadata.videoUrl ? UploadType.link : UploadType.file
        });
      } catch (error) {
        console.error(`Error processing metadata file ${file.name}:`, error);
        continue;
      }
    }

    return NextResponse.json(metadataContents);
  } catch (error) {
    console.error('Error in list-metadata route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
} 