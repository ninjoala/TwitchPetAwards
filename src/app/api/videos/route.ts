import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

// Initialize the UploadThing API
const utapi = new UTApi();

// Type for listing files
interface UTFile {
  name: string;
  size: number;
  customId: string | null;
  key: string;
  status: "Deletion Pending" | "Failed" | "Uploaded" | "Uploading";
  id: string;
  uploadedAt: number;
}

export async function GET() {
  try {
    // Get all files
    const response = await utapi.listFiles();
    const files = response.files;

    console.log("[API] Files fetched:", files.length);

    // Process files, separating videos and potential metadata JSON files
    const videos: any[] = [];
    const metadataFiles: Record<string, any> = {};

    // First pass: identify videos and metadata files
    files.forEach((file: UTFile) => {
      const fileUrl = `https://utfs.io/f/${file.key}`;
      
      if (file.name.endsWith('.json')) {
        metadataFiles[file.name] = {
          key: file.key,
          url: fileUrl,
          uploadedAt: file.uploadedAt
        };
      } else {
        // Assume all non-JSON files are videos
        videos.push({
          name: file.name,
          url: fileUrl,
          size: file.size || 0,
          type: "video",
          key: file.key,
          uploadedAt: new Date(file.uploadedAt).toISOString(),
          uploaderName: "",
          contactInfo: "",
          description: ""
        });
      }
    });

    console.log("[API] Videos identified:", videos.length);
    console.log("[API] Metadata files identified:", Object.keys(metadataFiles).length);

    // Second pass: try to match videos with their metadata
    const processedVideos = await Promise.all(videos.map(async (video) => {
      // Default metadata if we can't find a match
      let metadata = {
        uploaderName: "",
        contactInfo: "",
        description: ""
      };

      // Look for a metadata file that might correspond to this video
      const metadataFileName = `${video.name}.metadata.json`;
      if (metadataFiles[metadataFileName]) {
        try {
          // Fetch the content of the metadata file
          const metadataFile = metadataFiles[metadataFileName];
          const metadataResponse = await fetch(metadataFile.url);
          
          if (metadataResponse.ok) {
            const metadataContent = await metadataResponse.json();
            metadata = {
              uploaderName: metadataContent.uploaderName || "",
              contactInfo: metadataContent.contactInfo || "",
              description: metadataContent.description || ""
            };
            console.log(`[API] Found metadata for ${video.name}`);
          }
        } catch (error) {
          console.error(`[API] Error fetching metadata for ${video.name}:`, error);
        }
      }

      // Return video with metadata
      return {
        ...video,
        uploaderName: metadata.uploaderName,
        contactInfo: metadata.contactInfo,
        description: metadata.description
      };
    }));

    return NextResponse.json(processedVideos);
  } catch (error) {
    console.error("[API] Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch video files" },
      { status: 500 }
    );
  }
} 