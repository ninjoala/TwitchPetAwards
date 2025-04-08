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

    // Process files to extract metadata
    const processedFiles = files.map((file: UTFile) => {
      // We need to get metadata separately since it's not included in the list response
      // For now, we'll just use placeholder values
      const metadata = {
        uploaderName: "",
        contactInfo: "",
        description: ""
      };
      
      // Get URL from key using UploadThing pattern
      const fileUrl = `https://utfs.io/f/${file.key}`;
      
      return {
        name: file.name || "",
        url: fileUrl,
        size: file.size || 0,
        type: "video", // Assume video type
        uploaderName: metadata.uploaderName || "",
        contactInfo: metadata.contactInfo || "",
        description: metadata.description || "",
        uploadedAt: new Date(file.uploadedAt).toISOString()
      };
    });

    return NextResponse.json(processedFiles);
  } catch (error) {
    console.error("[API] Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch video files" },
      { status: 500 }
    );
  }
} 