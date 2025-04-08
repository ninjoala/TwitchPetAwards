"use client";

import { useState, useEffect } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import Image from "next/image";

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

interface UploadthingFile {
  key: string;
  name: string;
  url: string;
  size: number;
  type: string;
  metadata: unknown;
  createdAt: string;
}

export default function VideoList() {
  const [videos, setVideos] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // We'll use the server endpoint to get files
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      
      if (!response.ok) {
        throw new Error(`Error fetching videos: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[VIDEO_LIST] Fetched files:", data);
      
      setVideos(data);
    } catch (err) {
      console.error("[VIDEO_LIST] Error fetching files:", err);
      setError("Failed to fetch videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchVideos();
    }
  }, [visible]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleVisibility = () => {
    setVisible(!visible);
    if (!visible) {
      fetchVideos();
    }
  };

  return (
    <div className="mt-8">
      <button
        onClick={toggleVisibility}
        className="mb-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
      >
        {visible ? "Hide Uploaded Videos" : "Show Uploaded Videos"}
      </button>
      
      {visible && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Your Uploaded Videos</h2>
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-500 ml-2">Loading videos...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No videos have been uploaded yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => (
                <div key={index} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="relative w-full aspect-video bg-gray-200">
                    {video.url && (
                      <a href={video.url} target="_blank" rel="noopener noreferrer">
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </a>
                    )}
                  </div>
                  <div className="p-4">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                    >
                      {video.name}
                    </a>
                    <p className="text-sm text-gray-500 mb-3">
                      {formatFileSize(video.size)} • {new Date(video.uploadedAt).toLocaleDateString()}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-1">Video Metadata</h3>
                        <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
                          <span className="text-gray-600">Uploader:</span>
                          <span className="font-medium">{video.uploaderName || "Not provided"}</span>
                          
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">{video.contactInfo || "Not provided"}</span>
                          
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium">{video.description || "Not provided"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 