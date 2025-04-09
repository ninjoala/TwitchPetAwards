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
  videoTitle: string;
  videoUrl?: string;  // Added for link submissions
}

export default function VideoUploader() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [submissionType, setSubmissionType] = useState<'link' | 'upload' | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    videoTitle: ''
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
    setSubmissionType(null); // Reset submission type when saving new information
    console.log('Submission saved:', JSON.stringify(submission, null, 2));
  };

  const uploadMetadata = async (metadata: SubmissionData, videoFilename: string) => {
    try {
      console.log('[METADATA] Starting metadata upload for video:', videoFilename);
      
      // Create a JSON blob with the metadata
      const metadataBlob = new Blob([JSON.stringify({
        ...metadata,
        associatedVideo: videoFilename,
        videoTitle: metadata.videoTitle || videoFilename,
      }, null, 2)], { type: 'application/json' });

      // Create a File object from the blob
      const metadataFile = new File(
        [metadataBlob],
        `${videoFilename}.metadata.json`,
        { type: 'application/json' }
      );

      // Upload the metadata file using the hook
      const result = await startMetadataUpload([metadataFile]);
      console.log('[METADATA] Upload result:', result);
      
      if (!result) {
        throw new Error('No response from metadata upload');
      }
      
      return true;
    } catch (error) {
      console.error('[METADATA] Upload failed:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedSubmission) return;

    try {
      // Generate a unique ID for the link submission
      const linkSubmissionId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Create metadata with the video link
      const metadata = {
        ...savedSubmission,
        associatedVideo: linkSubmissionId,
        videoUrl: videoLink,
        videoTitle: savedSubmission.videoTitle
      };

      // Create a JSON blob with the metadata
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });

      // Create a File object from the blob
      const metadataFile = new File(
        [metadataBlob],
        `${linkSubmissionId}.metadata.json`,
        { type: 'application/json' }
      );

      // Upload the metadata file using the hook
      await startMetadataUpload([metadataFile]);
      alert('Link submission completed successfully!');
      setSavedSubmission(null);
      setVideoLink('');
      setSubmissionType(null);
    } catch (error) {
      console.error('[LINK SUBMISSION] Error:', error);
      alert('Failed to submit video link. Please try again.');
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
            <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-900 mb-1">Video Title</label>
            <input
              type="text"
              id="videoTitle"
              name="videoTitle"
              value={formData.videoTitle}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
              placeholder="Enter a title for your video"
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

      {savedSubmission && !submissionType && (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How would you like to submit your video?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSubmissionType('link')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Submit a Link</span>
            </button>
            <button
              onClick={() => setSubmissionType('upload')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Upload a Video</span>
            </button>
          </div>
        </div>
      )}

      {savedSubmission && submissionType === 'link' && (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200">
          <form onSubmit={handleLinkSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoLink" className="block text-sm font-medium text-gray-900 mb-1">Video URL</label>
              <input
                type="url"
                id="videoLink"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
                placeholder="https://example.com/video"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Submit Link
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {savedSubmission && submissionType === 'upload' && (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200">
          {selectedFile && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Selected video: {selectedFile}</span>
            </div>
          )}
          <div className="flex flex-col space-y-4">
            <UploadDropzone<OurFileRouter, "videoUploader">
              endpoint="videoUploader"
              onClientUploadComplete={async (res) => {
                try {
                  console.log("[UPLOAD] Upload completed:", res);
                  setUploadProgress(0);
                  
                  if (!res?.[0]) {
                    throw new Error('No response from video upload');
                  }
                  
                  if (!savedSubmission) {
                    throw new Error('No saved submission data');
                  }

                  // Upload the metadata
                  await uploadMetadata(savedSubmission, res[0].name);
                  
                  // Only clear state and show success message if both uploads succeed
                  alert(`Upload completed!\nFile name: ${res[0].name}`);
                  setSavedSubmission(null);
                  setSelectedFile(null);
                  setSubmissionType(null);
                } catch (error: Error | unknown) {
                  console.error("[UPLOAD] Error in upload completion:", error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                  alert(`Failed to complete the upload process. Please try again. Error: ${errorMessage}`);
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
                const originalFile = acceptedFiles[0];
                if (!originalFile) return;

                const newFilename = generateUniqueFilename(originalFile.name);
                console.log("[DROP] Original filename:", originalFile.name);
                console.log("[DROP] New filename:", newFilename);

                setSelectedFile(originalFile.name);

                const renamedFile = new File([originalFile], newFilename, {
                  type: originalFile.type,
                  lastModified: originalFile.lastModified,
                });

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
            <button
              type="button"
              onClick={() => setSubmissionType(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
      
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