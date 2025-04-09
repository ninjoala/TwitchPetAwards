import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function GET(request: Request) {
  try {
    // Get userId from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { files } = await utapi.listFiles();
    
    // Filter only favorite files for this user
    const favoriteFiles = files.filter(file => 
      file.name.startsWith(`favorite_${userId}_`) && 
      file.name.endsWith('.json')
    );

    // Extract the original file IDs from the favorite filenames
    const favoriteIds = favoriteFiles.map(file => {
      const match = file.name.match(`favorite_${userId}_(.+)\.json`);
      return match ? match[1] : null;
    }).filter(Boolean);

    return NextResponse.json(favoriteIds);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
} 