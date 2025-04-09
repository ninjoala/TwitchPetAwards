import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(async () => {
      console.log("[MIDDLEWARE] Request received");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("[UPLOAD_COMPLETE] File uploaded:", file.name);
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
      console.log("[MIDDLEWARE] Metadata request received");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("[UPLOAD_COMPLETE] Metadata uploaded:", file.name);
      return {
        name: file.name,
        url: file.url,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }),

  favoritesUploader: f({ "application/json": { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(async () => {
      console.log("[MIDDLEWARE] Favorites request received");
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("[UPLOAD_COMPLETE] Favorites uploaded:", file.name);
      return {
        name: file.name,
        url: file.url,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 