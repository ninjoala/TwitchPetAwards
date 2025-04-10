import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function DELETE(fileKey: string) {
  try {
    await utapi.deleteFiles([fileKey]);
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Failed to delete favorite" },
      { status: 500 }
    );
  }
} 