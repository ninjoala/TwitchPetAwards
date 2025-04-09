'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface VideoPreviewProps {
  videoName: string;
  videoTitle: string;
  videoUrl: string;
  isLinkSubmission?: boolean;
}

export default function VideoPreview({ videoName, videoTitle, videoUrl, isLinkSubmission }: VideoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('[VideoPreview] Props received:', {
      videoName,
      videoTitle,
      videoUrl,
      isLinkSubmission
    });

    if (isLinkSubmission) return; // Skip thumbnail generation for link submissions
    
    // Create a video element to generate thumbnail
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous'; // If your video is from a different domain

    // When video metadata is loaded, seek to 1 second and capture frame
    video.onloadedmetadata = () => {
      video.currentTime = 1; // Seek to 1 second
    };

    video.onseeked = () => {
      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnail(canvas.toDataURL('image/jpeg'));
      }
      video.remove(); // Clean up
    };
  }, [videoUrl, isLinkSubmission, videoName, videoTitle]);

  if (isLinkSubmission) {
    console.log('[VideoPreview] Rendering link submission with URL:', videoUrl);
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-500">Video URL:</span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Video URL
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group overflow-hidden rounded-lg hover:ring-2 hover:ring-blue-500 transition-all duration-200"
        >
          {thumbnail ? (
            <div className="relative aspect-video w-48 bg-black">
              <Image 
                src={thumbnail} 
                alt={videoName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Video
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative">
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-medium text-gray-900 truncate max-w-[80%]">{videoTitle || videoName}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <div className="aspect-video w-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  controls
                  className="max-h-[70vh] w-full"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 