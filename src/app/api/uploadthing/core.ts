import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create a new instance of UploadThing
const f = createUploadthing();

// Define metadata type
export type VideoMetadata = {
  uploaderName: string;
  contactInfo: string;
  description: string;
};

// Helper function to safely stringify objects
const safeStringify = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Error stringifying object: ${error}]`;
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define videoUploader route
  videoUploader: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      console.log("[MIDDLEWARE] Request received");
      
      // Read request body
      let formData = {};
      
      try {
        // Try to parse the body
        if (typeof req.body === 'string') {
          formData = JSON.parse(req.body);
        } else if (req.body && typeof req.body === 'object') {
          formData = req.body;
        }
      } catch (error) {
        console.error("[MIDDLEWARE] Error parsing body:", error);
      }
      
      console.log("[MIDDLEWARE] Form data:", formData);
      
      // Extract metadata with fallbacks
      const metadata = {
        uploaderName: (formData as any).uploaderName || "",
        contactInfo: (formData as any).contactInfo || "",
        description: (formData as any).description || ""
      };
      
      // Return metadata for use in onUploadComplete
      return metadata;
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