import { NextResponse } from 'next/server';
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const metadata = await req.json();
    
    // Create a JSON string from the metadata
    const jsonString = JSON.stringify(metadata, null, 2);
    
    // Create a Blob and convert it to a File object
    const file = new File([jsonString], `${metadata.associatedVideo}.metadata.json`, {
      type: "application/json"
    });

    // Upload the file using UploadThing
    const uploadResponse = await utapi.uploadFiles(file);

    // Since we're uploading a single file, uploadResponse is a single result
    if (!uploadResponse.data) {
      throw new Error('Failed to upload metadata');
    }

    return NextResponse.json({
      success: true,
      data: uploadResponse.data
    });
  } catch (error) {
    console.error('[METADATA API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process metadata submission' },
      { status: 500 }
    );
  }
} 