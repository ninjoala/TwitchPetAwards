import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create a new instance of UploadThing
const f = createUploadthing();

// Define metadata type
interface VideoMetadata {
  uploaderName: string;
  contactInfo: string;
  description: string;
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define videoUploader route
  videoUploader: f({ video: { maxFileSize: "32MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      console.log("[MIDDLEWARE] Request received");
      
      // Read request body
      const formData = await req.json() as VideoMetadata;
      
      console.log("[MIDDLEWARE] Form data:", formData);
      
      // Return metadata for use in onUploadComplete
      return {
        uploaderName: formData.uploaderName || "",
        contactInfo: formData.contactInfo || "",
        description: formData.description || ""
      };
    })
    // Define onUploadComplete - executed on successful upload
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("[UPLOAD_COMPLETE] File uploaded:", file.name);
      console.log("[UPLOAD_COMPLETE] Metadata:", metadata);
      
      // Return file details and metadata
      return {
        name: file.name,
        url: file.url,
        size: file.size,
        type: file.type,
        uploaderName: metadata.uploaderName,
        contactInfo: metadata.contactInfo,
        description: metadata.description,
        uploadedAt: new Date().toISOString()
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 