import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({
    video: {
      maxFileSize: "512MB",
      maxFileCount: 1
    }
  })
    .middleware(async () => {
      // This code runs on your server before upload
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for file:", file.name);
      console.log("File URL:", file.url);
      console.log("File size:", file.size);
      console.log("File type:", file.type);
      console.log("Uploaded at:", metadata.uploadedAt);

      return { 
        uploadedBy: metadata,
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 