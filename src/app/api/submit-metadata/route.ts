import { NextResponse } from 'next/server';
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  try {
    const metadata = await req.json();
    console.log('[METADATA API] Received metadata:', {
      associatedVideo: metadata.associatedVideo,
      videoTitle: metadata.videoTitle,
      videoUrl: metadata.videoUrl,
      isLink: metadata.associatedVideo?.startsWith('link_')
    });
    
    // Ensure we preserve the videoUrl for link submissions
    const metadataToSave = {
      ...metadata,
      videoUrl: metadata.videoUrl || undefined // Explicitly preserve videoUrl
    };
    
    console.log('[METADATA API] Saving metadata:', {
      associatedVideo: metadataToSave.associatedVideo,
      videoTitle: metadataToSave.videoTitle,
      videoUrl: metadataToSave.videoUrl,
      isLink: metadataToSave.associatedVideo?.startsWith('link_')
    });
    
    // Create a JSON string from the metadata
    const jsonString = JSON.stringify(metadataToSave, null, 2);
    
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

    console.log('[METADATA API] Upload successful:', uploadResponse.data);

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