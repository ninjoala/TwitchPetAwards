import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await auth();
  if (!session?.userId) throw new Error("Unauthorized");
  return { userId: session.userId };
};

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(async () => {
      const authData = await handleAuth();
      console.log("[MIDDLEWARE] Video upload request received for user:", authData.userId);
      return authData;
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[UPLOAD_COMPLETE] File uploaded:", file.name, "by user:", metadata.userId);
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
      console.log("[MIDDLEWARE] Metadata request received for user:", authData.userId);
      return authData;
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[UPLOAD_COMPLETE] Metadata uploaded:", file.name, "by user:", metadata.userId);
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
      console.log("[MIDDLEWARE] Favorites request received for user:", authData.userId);
      return authData;
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[UPLOAD_COMPLETE] Favorites uploaded:", file.name, "by user:", metadata.userId);
      return {
        name: file.name,
        url: file.url,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 