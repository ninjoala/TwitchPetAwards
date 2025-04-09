'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import VideoPreview from '@/components/VideoPreview';
import { useState } from 'react';

interface FileInfo {
  name: string;
  url: string;
  uploadedAt: string;
  key: string;
  id: string;
  status: "Uploaded" | "Uploading" | "Failed" | "Deletion Pending";
}

interface MetadataContent {
  name: string;
  email: string;
  description: string;
  submittedAt: string;
  associatedVideo: string;
  videoUrl?: string;
  fileInfo: FileInfo;
}

export default function DashboardContent({ 
  initialMetadata, 
  userName 
}: { 
  initialMetadata: MetadataContent[],
  userName: string | null 
}) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [metadata, setMetadata] = useState(initialMetadata);

  const toggleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    const sorted = [...metadata].sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return newOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    
    setMetadata(sorted);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {userName || 'User'}!
              </h1>
              <UserButton afterSignOutUrl="/" />
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Recent Submissions</h2>
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50"
                  >
                    Sort by Date
                    <svg 
                      className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {metadata.length === 0 ? (
                    <p className="text-gray-500">No submissions found.</p>
                  ) : (
                    metadata.map((entry) => (
                      <div key={entry.fileInfo.id} className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Submitter Name</span>
                              <h3 className="text-lg font-medium text-gray-900">{entry.name}</h3>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Email</span>
                              <p className="text-gray-700">{entry.email}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Submitted On</span>
                            <p className="text-sm text-gray-700">
                              {formatDateTime(entry.submittedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-sm font-medium text-gray-500">Description</span>
                          <p className="mt-1 text-gray-700">{entry.description}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Associated Video</span>
                            <div className="mt-1">
                              <p className="text-gray-700">{entry.associatedVideo}</p>
                              {entry.videoUrl && (
                                <div className="mt-2">
                                  <VideoPreview 
                                    videoName={entry.associatedVideo}
                                    videoUrl={entry.videoUrl}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-500">Status</span>
                            <p className={`mt-1 px-2 py-1 rounded-full text-sm ${
                              entry.fileInfo.status === 'Uploaded' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {entry.fileInfo.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
} 