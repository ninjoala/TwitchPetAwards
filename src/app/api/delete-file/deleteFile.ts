"use server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteFiles(fileKey: string) {
    try {
    await utapi.deleteFiles([fileKey]);
    } catch (error) {
        console.debug(error);
  }
} 