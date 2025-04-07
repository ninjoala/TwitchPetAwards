"use client";

import { useState } from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function VideoUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg p-6">
      <UploadDropzone<OurFileRouter, "videoUploader">
        endpoint="videoUploader"
        onClientUploadComplete={(res) => {
          if (res) {
            const files = res.map((file) => ({
              name: file.name,
              url: file.url,
              size: file.size,
              type: file.type,
            }));
            setUploadedFiles((prev) => [...prev, ...files]);
            alert("Upload Completed Successfully!");
          }
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR: ${error.message}`);
        }}
        onUploadBegin={(fileName: string) => {
          console.log("Upload started", fileName);
        }}
        appearance={{
          container: "p-8 mt-4",
          allowedContent: "text-sm text-gray-600",
          button: "ut-uploading:bg-orange-400 ut-uploading:after:bg-orange-400/30 bg-blue-500",
        }}
      />
      
      {uploadedFiles.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Uploaded Videos:</h3>
          <ul className="space-y-4">
            {uploadedFiles.map((file, idx) => (
              <li key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline font-medium"
                >
                  {file.name}
                </a>
                <div className="text-sm text-gray-500 mt-1">
                  <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>Type: {file.type}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 