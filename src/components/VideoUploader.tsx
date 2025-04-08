"use client";

import { useState, useRef } from "react";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { uploadFiles } from "@/utils/uploadthing";

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uploaderName: string;
  contactInfo: string;
  description: string;
  uploadedAt: string;
}

interface SelectedFile {
  name: string;
  size: number;
}

// Helper function to safely stringify objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeStringify = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Error stringifying object: ${error}]`;
  }
};

export default function VideoUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    uploaderName: "",
    contactInfo: "",
    description: ""
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metadataJson, setMetadataJson] = useState<string | null>(null);
  const videoFileRef = useRef<File | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    console.log("[FORM] Data updated:", safeStringify(newFormData));
    
    setIsFormValid(
      Boolean(newFormData.uploaderName && 
      newFormData.contactInfo && 
      newFormData.description)
    );
    
    // Update the metadata JSON whenever form data changes
    if (selectedFile) {
      updateMetadataJson(newFormData, selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log("[FORM] Submitted with data:", safeStringify(formData));
      setShowUploader(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const updateMetadataJson = (formData: any, file: SelectedFile) => {
    const metadata = {
      uploaderName: formData.uploaderName,
      contactInfo: formData.contactInfo,
      description: formData.description,
      videoFileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };
    
    setMetadataJson(JSON.stringify(metadata, null, 2));
  };
  
  const createMetadataFile = (videoFileName: string): File => {
    if (!metadataJson) {
      throw new Error("Metadata JSON is not available");
    }
    
    // Create a new file with the metadata JSON
    const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
    const metadataFile = new File(
      [metadataBlob], 
      `${videoFileName}.metadata.json`, 
      { type: 'application/json' }
    );
    
    return metadataFile;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Submit Your Video</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="uploaderName" className="block text-sm font-medium text-gray-900 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                id="uploaderName"
                name="uploaderName"
                value={formData.uploaderName}
                onChange={handleFormChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-900 mb-1">
                Contact Info (Email) *
              </label>
              <input
                type="email"
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleFormChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
                Video Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                required
              />
            </div>
            {!showUploader && (
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  isFormValid 
                    ? 'bg-blue-500 hover:bg-blue-600 transition-colors' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Continue to Upload
              </button>
            )}
          </form>
        </div>

        {/* Upload Section */}
        {showUploader && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Upload Your Video</h3>
            <div className="max-w-xl mx-auto">
              {selectedFile ? (
                <div className="p-6 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">Ready to Upload:</h4>
                      <p className="text-lg text-gray-900 font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{formatFileSize(selectedFile.size)}</p>
                      <div className="mt-3 text-xs text-gray-700 bg-gray-100 p-2 rounded">
                        <p>Uploader: {formData.uploaderName}</p>
                        <p>Contact: {formData.contactInfo}</p>
                        <p>Description: {formData.description}</p>
                      </div>
                      
                      {metadataJson && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Metadata JSON:</p>
                          <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded text-left overflow-auto max-h-32">
                            {metadataJson}
                          </pre>
                          <p className="text-xs text-gray-600 mt-1">
                            This JSON file will be uploaded alongside your video.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => {
                          console.log("[FILE] Resetting file selection");
                          setSelectedFile(null);
                          setMetadataJson(null);
                          videoFileRef.current = null;
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Choose Different File
                      </button>
                      <button
                        type="button"
                        disabled={isUploading}
                        className={`px-6 py-2 rounded-lg text-white font-medium ${
                          isUploading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 transition-colors'
                        }`}
                        onClick={async () => {
                          if (!selectedFile || !videoFileRef.current) {
                            alert("No video file selected");
                            return;
                          }
                          
                          try {
                            console.log("[UPLOAD] Starting upload process");
                            console.log("[METADATA] Metadata JSON:", metadataJson);
                            setIsUploading(true);
                            
                            // Create metadata JSON file
                            const metadataFile = createMetadataFile(selectedFile.name);
                            console.log("[METADATA] Created metadata file:", metadataFile.name);
                            
                            // Upload both video and metadata files
                            const res = await uploadFiles({
                              endpoint: "videoUploader",
                              files: [videoFileRef.current, metadataFile],
                              input: formData
                            });
                            
                            console.log("[UPLOAD] Completed with response:", safeStringify(res));
                            
                            if (res) {
                              // Handle the response similar to onClientUploadComplete
                              const files = res.map(file => file as unknown as UploadedFile);
                              setUploadedFiles((prev) => [...prev, ...files]);
                              alert("Upload Completed Successfully!");
                              
                              setFormData({
                                uploaderName: "",
                                contactInfo: "",
                                description: ""
                              });
                              setIsFormValid(false);
                              setShowUploader(false);
                              setSelectedFile(null);
                              setIsUploading(false);
                              videoFileRef.current = null;
                            }
                          } catch (error) {
                            console.error("[UPLOAD] Error:", error);
                            alert(`ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
                            setIsUploading(false);
                          }
                        }}
                      >
                        {isUploading ? 'Uploading...' : 'Start Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <UploadDropzone<OurFileRouter, "videoUploader">
                  endpoint="videoUploader"
                  onClientUploadComplete={(res) => {
                    console.log("[UPLOAD] Completed with response:", safeStringify(res));
                    if (res) {
                      const files = res.map(file => file as unknown as UploadedFile);
                      setUploadedFiles((prev) => [...prev, ...files]);
                      alert("Upload Completed Successfully!");
                      
                      setFormData({
                        uploaderName: "",
                        contactInfo: "",
                        description: ""
                      });
                      setIsFormValid(false);
                      setShowUploader(false);
                      setSelectedFile(null);
                      setIsUploading(false);
                      videoFileRef.current = null;
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("[UPLOAD] Error:", error);
                    console.error("[UPLOAD] Error message:", error.message);
                    console.error("[UPLOAD] Error stack:", error.stack);
                    console.log("[UPLOAD] Current form data:", safeStringify(formData));
                    alert(`ERROR: ${error.message}`);
                    setIsUploading(false);
                  }}
                  onUploadBegin={(fileName: string) => {
                    console.log("[UPLOAD] Starting for file:", fileName);
                    console.log("[UPLOAD] With form data:", safeStringify(formData));
                    setIsUploading(true);
                  }}
                  onDrop={(acceptedFiles: File[]) => {
                    const file = acceptedFiles[0];
                    console.log("[FILE] Dropped:", safeStringify({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      lastModified: file.lastModified
                    }));
                    if (file) {
                      const selectedFileInfo = {
                        name: file.name,
                        size: file.size
                      };
                      console.log("[FILE] Setting selected file:", selectedFileInfo);
                      setSelectedFile(selectedFileInfo);
                      
                      // Save the actual File object for later upload
                      videoFileRef.current = file;
                      
                      // Generate metadata JSON when file is selected
                      updateMetadataJson(formData, selectedFileInfo);
                    }
                  }}
                  appearance={{
                    container: "p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-500 transition-colors",
                    label: "text-gray-900 font-medium",
                    allowedContent: "text-gray-600 text-sm",
                    button: "hidden",
                    uploadIcon: "text-gray-600 w-12 h-12",
                  }}
                  content={{
                    label: "Drop your video here or click to browse",
                    allowedContent: "Video files up to 512MB",
                  }}
                  config={{ mode: "auto" }}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Videos</h3>
            <ul className="space-y-4">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    {file.name}
                  </a>
                  <div className="text-sm text-gray-900 mt-2 space-y-1">
                    <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p>Type: {file.type}</p>
                    <p>Uploader: {file.uploaderName}</p>
                    <p>Contact: {file.contactInfo}</p>
                    <p>Description: {file.description}</p>
                    <p>Uploaded: {new Date(file.uploadedAt).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 