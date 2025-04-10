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
    
    // Create a map of video filenames to their URLs
    const videoMap = new Map(
      files
        .filter(file => file.name.endsWith('.mp4') || file.name.endsWith('.webm'))
        .map(file => [file.name, `https://utfs.io/f/${file.key}`])
    );

    // Filter only metadata files and map to FileInfo structure
    const metadataFiles = files
      .filter(file => file.name.endsWith('.metadata.json'))
      .map(file => ({
        name: file.name,
        url: `https://utfs.io/f/${file.key}`,
        uploadedAt: new Date(file.uploadedAt).toISOString(),
        key: file.key,
        id: file.id,
        status: file.status
      }));

    // For each metadata file, fetch its content
    const metadataContents = await Promise.all(
      metadataFiles.map(async (file: FileInfo) => {
        try {
          const response = await fetch(file.url);
          const metadata = await response.json();
          return {
            ...metadata,
            videoUrl: metadata.videoUrl != null ? metadata.videoUrl : videoMap.get(metadata.associatedVideo), // Add the video URL
            fileInfo: file,
            uploadMethod: videoMap.get(metadata.associatedVideo) != null ? UploadType.file : UploadType.link
          } as MetadataContent;
        } catch (error) {
          console.error(`Error fetching metadata for ${file.name}:`, error);
          return null;
        }
      })
    );

    console.log(metadataContents);
    // Filter out any failed fetches and sort by uploadedAt
    const validMetadata = metadataContents
      .filter((item: MetadataContent | null): item is MetadataContent => item !== null)
      .sort((a: MetadataContent, b: MetadataContent) => 
        new Date(b.fileInfo.uploadedAt).getTime() - new Date(a.fileInfo.uploadedAt).getTime()
      );
    return NextResponse.json(validMetadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
} 