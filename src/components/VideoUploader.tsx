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
  isAdopted: boolean; // Added for adoption status
  petName: string;    // Added for pet name
}

export default function VideoUploader() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [submissionType, setSubmissionType] = useState<'link' | 'upload' | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    videoTitle: '',
    isAdopted: false,
    petName: ''
  });
  const [savedSubmission, setSavedSubmission] = useState<SubmissionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  
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
      
      // Clear all form data after successful upload
      setFormData({
        name: '',
        email: '',
        description: '',
        videoTitle: '',
        isAdopted: false,
        petName: ''
      });
      setSavedSubmission(null);
      setSelectedFile(null);
      setSubmissionType(null);
      
      return true;
    } catch (error) {
      console.error('[METADATA] Upload failed:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedSubmission) return;
    if (!videoLink) {
      setError('Please enter a valid video URL');
      return;
    }

    try {
      setIsSubmitting(true);
      // Generate a unique ID for the link submission
      const linkSubmissionId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Create metadata with the video link
      const metadata = {
        ...savedSubmission,
        associatedVideo: linkSubmissionId,
        videoUrl: videoLink.trim(), // Ensure we trim the URL
        videoTitle: savedSubmission.videoTitle || 'Video Link Submission'
      };

      console.log('[LINK SUBMISSION] Creating metadata:', metadata);

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
      setShowSuccessPopup(true);
      // Clear all form data
      setFormData({
        name: '',
        email: '',
        description: '',
        videoTitle: '',
        isAdopted: false,
        petName: ''
      });
      setSavedSubmission(null);
      setVideoLink('');
      setSubmissionType(null);
    } catch (error) {
      console.error('[LINK SUBMISSION] Error:', error);
      alert('Failed to submit video link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-lg font-bold text-gray-900 mb-2">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-lg font-bold text-gray-900 mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <label htmlFor="videoTitle" className="block text-lg font-bold text-gray-900 mb-2">Video Title:</label>
            <input
              type="text"
              id="videoTitle"
              name="videoTitle"
              value={formData.videoTitle}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter a title for your video"
              required
            />
          </div>
          <div>
            <label htmlFor="petName" className="block text-lg font-bold text-gray-900 mb-2">Pet Name:</label>
            <input
              type="text"
              id="petName"
              name="petName"
              value={formData.petName}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter your pet's name"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-lg font-bold text-gray-900 mb-2">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Tell us about your video and why it should be considered"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAdopted"
              name="isAdopted"
              checked={formData.isAdopted}
              onChange={(e) => setFormData(prev => ({ ...prev, isAdopted: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAdopted" className="text-lg font-bold text-gray-900">Was your pet adopted?</label>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-48 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={!formData.name || !formData.email || !formData.videoTitle || !formData.description}
            >
              <span className="flex items-center justify-center">
                <span>Save & Continue</span>
                <svg className="animate-spin -mr-1 ml-2 h-4 w-4 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </button>
          </div>
        </form>
      </div>

      {savedSubmission && !submissionType && (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">How would you like to submit your video?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSubmissionType('link')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Submit a Link</span>
            </button>
            <button
              onClick={() => setSubmissionType('upload')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
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
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200 mt-8">
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
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-blue-800 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className="flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Link"
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-gray-100 cursor-pointer"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {savedSubmission && submissionType === 'upload' && (
        <div className="bg-gray-50 rounded-xl shadow-sm p-8 border border-gray-200 mt-8">
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
                  setIsSubmitting(false);
                  
                  if (!res?.[0]) {
                    throw new Error('No response from video upload');
                  }
                  
                  if (!savedSubmission) {
                    throw new Error('No saved submission data');
                  }

                  // Upload the metadata
                  await uploadMetadata(savedSubmission, res[0].name);
                  
                  // Show success popup
                  setShowSuccessPopup(true);
                  setSavedSubmission(null);
                  setSelectedFile(null);
                  setSubmissionType(null);
                } catch (error) {
                  console.error("[UPLOAD] Error in upload completion:", error);
                  setError(error instanceof Error ? error.message : 'An unknown error occurred');
                  setShowErrorPopup(true);
                }
              }}
              onUploadError={(error: Error) => {
                console.error("[UPLOAD] Error:", error);
                setIsSubmitting(false);
                setError(error.message);
                setShowErrorPopup(true);
              }}
              onUploadBegin={(fileName) => {
                console.log("[UPLOAD] Starting upload of:", fileName);
                setIsSubmitting(true);
                setError(null);
              }}
              onDrop={async (acceptedFiles) => {
                try {
                  const originalFile = acceptedFiles[0];
                  if (!originalFile) {
                    throw new Error('No file selected');
                  }

                  const newFilename = generateUniqueFilename(originalFile.name);
                  console.log("[DROP] Original filename:", originalFile.name);
                  console.log("[DROP] New filename:", newFilename);

                  setSelectedFile(originalFile.name);
                  setError(null);

                  const renamedFile = new File([originalFile], newFilename, {
                    type: originalFile.type,
                    lastModified: originalFile.lastModified,
                  });

                  acceptedFiles[0] = renamedFile;
                } catch (error) {
                  console.error("[DROP] Error:", error);
                  setError(error instanceof Error ? error.message : 'An unknown error occurred');
                  setShowErrorPopup(true);
                }
              }}
              appearance={{
                container: "p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-500 transition-colors cursor-pointer",
                label: "text-gray-800 font-medium",
                allowedContent: "text-gray-600 text-sm mt-2",
                button: "relative flex h-10 items-center justify-center rounded-lg text-white font-medium transition-all duration-200 ease-in-out px-6 py-3 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed data-[state=ready]:bg-blue-600 data-[state=ready]:hover:bg-blue-700 data-[state=uploading]:bg-blue-500 data-[state=uploading]:hover:bg-blue-600 data-[state=error]:bg-red-600 data-[state=error]:hover:bg-red-700 mt-6"
              }}
              content={{
                label: "Drop your video here or click to choose",
                allowedContent: "Video files up to 512MB",
                button: (args) => {
                  if (args.ready) return (
                    <span className="flex items-center justify-center">
                      <span>Submit</span>
                      {isSubmitting && (
                        <svg className="animate-spin -mr-1 ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </span>
                  );
                  if (args.isUploading) return (
                    <span className="flex items-center justify-center">
                      <span>Uploading...</span>
                      <svg className="animate-spin -mr-1 ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  );
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
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-gray-100 cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      )}
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all duration-300 ease-out scale-100 opacity-100">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 text-center mb-6">Your video has been submitted successfully.</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-blue-800 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all duration-300 ease-out scale-100 opacity-100">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Error!</h3>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-blue-800 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 