"use client";

import { UploadDropzone } from "@uploadthing/react";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";

// Function to generate a unique filename
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

export default function VideoUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200">
        <UploadDropzone<OurFileRouter, "videoUploader">
          endpoint="videoUploader"
          onClientUploadComplete={(res) => {
            console.log("[UPLOAD] Upload completed:", res);
            setUploadProgress(0);
            if (res && res[0]) {
              alert(`Upload completed!\nFile name: ${res[0].name}`);
            } else {
              alert("Upload completed!");
            }
          }}
          onUploadError={(error: Error) => {
            console.error("[UPLOAD] Error:", error);
            setUploadProgress(0);
            alert(`ERROR! ${error.message}`);
          }}
          onUploadBegin={(fileName) => {
            console.log("[UPLOAD] Starting upload of:", fileName);
            setUploadProgress(0);
          }}
          onUploadProgress={(progress) => {
            setUploadProgress(progress);
          }}
          onDrop={async (acceptedFiles) => {
            // Get the first file
            const originalFile = acceptedFiles[0];
            if (!originalFile) return;

            // Generate a new filename
            const newFilename = generateUniqueFilename(originalFile.name);
            console.log("[DROP] Original filename:", originalFile.name);
            console.log("[DROP] New filename:", newFilename);

            // Create a new file with the generated name
            const renamedFile = new File([originalFile], newFilename, {
              type: originalFile.type,
              lastModified: originalFile.lastModified,
            });

            // Replace the original file in the array
            acceptedFiles[0] = renamedFile;
          }}
          appearance={{
            container: "p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-500 transition-colors cursor-pointer",
            label: "text-gray-800 font-medium",
            allowedContent: "text-gray-600 text-sm mt-2",
            button: "relative flex h-10 items-center justify-center rounded-lg text-white font-medium transition-all duration-200 ease-in-out px-6 py-3 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed data-[state=ready]:bg-blue-600 data-[state=ready]:hover:bg-blue-700 data-[state=uploading]:bg-blue-500 data-[state=uploading]:hover:bg-blue-600 data-[state=error]:bg-red-600 data-[state=error]:hover:bg-red-700"
          }}
          content={{
            label: "Drop your video here or click to choose",
            allowedContent: "Video files up to 512MB",
            button: (args) => {
              if (args.ready) return "Submit";
              if (args.isUploading) return "Uploading...";
              return "Getting ready...";
            }
          }}
          config={{
            mode: "manual"
          }}
        />
      </div>
      
      {/* Bottom Progress Indicator */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-6 text-center">
          <div className="relative h-4 w-full bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-blue-600 font-medium">Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}
    </div>
  );
} 