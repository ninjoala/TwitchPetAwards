import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await auth();
  return { userId: session?.userId || 'anonymous' };
};

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(async () => {
      return { userId: 'anonymous', metadata: {} };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        name: file.name,
        url: file.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }),
    
  metadataUploader: f({ "application/json": { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(async () => {
      const authData = await handleAuth();
      return { userId: authData.userId, metadata: {} };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        name: file.name,
        url: file.url,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }),

  favoritesUploader: f({ "application/json": { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(async () => {
      const authData = await handleAuth();
      return { userId: authData.userId, metadata: {} };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        name: file.name,
        url: file.url,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 