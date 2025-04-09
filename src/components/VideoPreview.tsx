'use client';

import { useState } from 'react';

interface VideoPreviewProps {
  videoName: string;
  videoUrl: string;
}

export default function VideoPreview({ videoName, videoUrl }: VideoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 underline text-sm"
      >
        View Video
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <h3 className="text-lg font-medium text-gray-900 truncate max-w-[80%]">{videoName}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <div className="aspect-video max-h-[70vh] flex items-center justify-center bg-black rounded-lg">
                <video
                  controls
                  className="max-h-full max-w-full"
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