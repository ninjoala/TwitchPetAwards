import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function DELETE(request: Request) {
  try {
    // Get userId and fileId from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const fileId = searchParams.get('fileId');

    if (!userId || !fileId) {
      return NextResponse.json(
        { error: "User ID and File ID are required" },
        { status: 400 }
      );
    }

    const { files } = await utapi.listFiles();
    
    // Find the favorite file for this user and file ID
    const favoriteFile = files.find(file => 
      file.name === `favorite_${userId}_${fileId}.json`
    );

    if (!favoriteFile) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    // Delete the file
    await utapi.deleteFiles(favoriteFile.key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
} 