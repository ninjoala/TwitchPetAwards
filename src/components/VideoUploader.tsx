"use client";

import { UploadDropzone } from "@uploadthing/react";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import { useUploadThing } from "@/utils/uploadthing";

// Function to generate a unique filename
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

interface SubmissionData {
  name: string;
  email: string;
  description: string;
  submittedAt: string;
}

export default function VideoUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
  });
  const [savedSubmission, setSavedSubmission] = useState<SubmissionData | null>(null);
  
  // Initialize the upload hook for metadata
  const { startUpload: startMetadataUpload } = useUploadThing("metadataUploader", {
    onUploadProgress: () => {}, // We don't show metadata upload progress
    onClientUploadComplete: () => {
      console.log('[METADATA] Upload completed successfully');
    },
    onUploadError: (error) => {
      console.error('[METADATA] Upload failed:', error);
    }
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submission: SubmissionData = {
      ...formData,
      submittedAt: new Date().toISOString()
    };
    setSavedSubmission(submission);
    console.log('Submission saved:', JSON.stringify(submission, null, 2));
  };

  // Function to upload metadata in the background
  const uploadMetadata = async (metadata: SubmissionData, videoFilename: string) => {
    try {
      // Create a JSON blob with the metadata
      const metadataBlob = new Blob([JSON.stringify({
        ...metadata,
        associatedVideo: videoFilename,
      })], { type: 'application/json' });

      // Create a File object from the blob
      const metadataFile = new File(
        [metadataBlob],
        `${videoFilename}.metadata.json`,
        { type: 'application/json' }
      );

      // Upload the metadata file using the hook
      await startMetadataUpload([metadataFile]);
    } catch (error) {
      console.error('[METADATA] Upload failed:', error);
      // We don't alert the user about metadata upload failures
      // to maintain the original user experience
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200 mb-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Information
          </button>
        </form>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200">
        {selectedFile && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Selected video: {selectedFile}</span>
          </div>
        )}
        <UploadDropzone<OurFileRouter, "videoUploader">
          endpoint="videoUploader"
          onClientUploadComplete={(res) => {
            console.log("[UPLOAD] Upload completed:", res);
            setUploadProgress(0);
            // If we have both the video upload result and saved submission data
            if (res && res[0] && savedSubmission) {
              // Upload the metadata in the background
              uploadMetadata(savedSubmission, res[0].name);
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

            // Set the selected file name
            setSelectedFile(originalFile.name);

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