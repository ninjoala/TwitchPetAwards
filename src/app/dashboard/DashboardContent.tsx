'use client';

import { SignedIn } from '@clerk/nextjs';
import VideoPreview from '@/components/VideoPreview';
import { useState, useEffect } from 'react';
import { deleteFiles } from "../api/delete-file/deleteFile";
import { useUploadThing } from '@/utils/uploadthing';

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
  videoTitle: string;
  videoUrl?: string;
  fileInfo: FileInfo;
  uploadMethod: UploadType;
  isAdopted: boolean;
}

enum UploadType {
  link,
  file
}

export default function DashboardContent({ 
  initialMetadata, 
  userName,
  userId
}: { 
  initialMetadata: MetadataContent[],
  userName: string | null,
    userId: string,
}) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [metadata, setMetadata] = useState<MetadataContent[]>(initialMetadata);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAdoptedOnly, setShowAdoptedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { startUpload: startFavoriteUpload } = useUploadThing("favoritesUploader");
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());
  const [loadingFavorite, setLoadingFavorite] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<MetadataContent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set loading to false once initial data is loaded
  useEffect(() => {
    if (initialMetadata) {
      setIsLoading(false);
    }
  }, [initialMetadata]);

  // Debug logging for metadata changes
  useEffect(() => {
    console.log('[DEBUG] Initial metadata:', initialMetadata.map(entry => ({
      id: entry.fileInfo.id,
      videoTitle: entry.videoTitle,
      associatedVideo: entry.associatedVideo,
      videoUrl: entry.videoUrl,
      isLink: entry.associatedVideo.startsWith('link_')
    })));
  }, [initialMetadata]);

  useEffect(() => {
    console.log('[PERF] DashboardContent mounted');
    const startTime = performance.now();
    
    // Debug logging for filtered metadata
    const filtered = showFavoritesOnly
      ? metadata.filter(entry => favoritedItems.has(entry.fileInfo.id))
      : metadata;
    
    const endTime = performance.now();
    console.log(`[PERF] Metadata filtering completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    console.log('[DEBUG] Filtered metadata:', filtered.map(entry => ({
      id: entry.fileInfo.id,
      videoTitle: entry.videoTitle,
      associatedVideo: entry.associatedVideo,
      videoUrl: entry.videoUrl,
      isLink: entry.associatedVideo.startsWith('link_')
    })));
  }, [metadata, showFavoritesOnly, favoritedItems]);

  // Fetch favorites when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      const startTime = performance.now();
      console.log('[PERF] Starting favorites fetch');
      
      try {
        const response = await fetch(`/api/list-favorites?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favoriteIds = await response.json();
        setFavoritedItems(new Set(favoriteIds));
        
        const endTime = performance.now();
        console.log(`[PERF] Favorites fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setNotification({
          message: 'Failed to load favorites',
          type: 'error'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    };

    fetchFavorites();
  }, [userId]);

  const handleFavorite = async (entry: MetadataContent) => {
    try {
      setLoadingFavorite(entry.fileInfo.id);
      
      // If already favorited, delete the favorite
      if (favoritedItems.has(entry.fileInfo.id)) {
        const response = await fetch(
          `/api/delete-favorite?userId=${userId}&fileId=${entry.fileInfo.id}`,
          { method: 'DELETE' }
        );
        
        if (!response.ok) throw new Error('Failed to remove favorite');
        
        setFavoritedItems(prev => {
          const next = new Set(prev);
          next.delete(entry.fileInfo.id);
          return next;
        });
        
        setNotification({
          message: 'Removed from favorites',
          type: 'success'
        });
      } else {
        // Create a JSON blob with the entry data
        const favoriteBlob = new Blob([JSON.stringify(entry)], { 
          type: 'application/json' 
        });

        // Create a unique filename for this favorite
        const favoriteFile = new File(
          [favoriteBlob],
          `favorite_${userId}_${entry.fileInfo.id}.json`,
          { type: 'application/json' }
        );

        // Upload the favorite
        const result = await startFavoriteUpload([favoriteFile]);
        if (result) {
          console.log('Favorite saved:', result);
          setFavoritedItems(prev => new Set([...prev, entry.fileInfo.id]));
          setNotification({
            message: 'Added to favorites!',
            type: 'success'
          });
        }
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setNotification({
        message: favoritedItems.has(entry.fileInfo.id) 
          ? 'Failed to remove from favorites' 
          : 'Failed to add to favorites',
        type: 'error'
      });
      
      // Clear error notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoadingFavorite(null);
    }
  };

  const handleDelete = async (data: MetadataContent) => {
    await deleteFiles(data.fileInfo.key);
    const updatedMetadata = metadata.filter(item => item.fileInfo.key !== data.fileInfo.key);
    setMetadata(updatedMetadata);
  };

  const handleDeleteClick = (entry: MetadataContent) => {
    setDeleteConfirmation(entry);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation) {
      setIsDeleting(true);
      try {
        await handleDelete(deleteConfirmation);
      } finally {
        setIsDeleting(false);
        setDeleteConfirmation(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

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

  const filteredMetadata = showFavoritesOnly
    ? metadata.filter(entry => favoritedItems.has(entry.fileInfo.id))
    : metadata;

  const filteredByAdoption = showAdoptedOnly
    ? filteredMetadata.filter(entry => entry.isAdopted)
    : filteredMetadata;

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50">
        {notification && (
          <div
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {notification.message}
          </div>
        )}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to the dashboard!
              </h1>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">
                      {showFavoritesOnly
                        ? "Favorite Videos"
                        : showAdoptedOnly
                        ? "Adopted Pets"
                        : "Recent Submissions"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                        showFavoritesOnly
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : "text-yellow-600 hover:text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={showFavoritesOnly ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      {showFavoritesOnly ? "Show All" : "Show Favorites"}
                    </button>
                    <button
                      onClick={() => setShowAdoptedOnly(!showAdoptedOnly)}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                        showAdoptedOnly
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "text-green-600 hover:text-green-700 border border-green-200 hover:bg-green-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={showAdoptedOnly ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {showAdoptedOnly ? "Show All" : "Show Only Adopted"}
                    </button>
                    <button
                      onClick={toggleSort}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50"
                    >
                      Sort by Date
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          sortOrder === "desc" ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
                      >
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                  ) : filteredByAdoption.length === 0 ? (
                    <p className="text-gray-500 col-span-full">
                      {showFavoritesOnly
                        ? "No favorite videos yet. Click the star icon on any video to add it to your favorites!"
                        : showAdoptedOnly
                        ? "No adopted pets found."
                        : "No submissions found."}
                    </p>
                  ) : (
                    filteredByAdoption.map((entry) => (
                      <div
                        key={entry.fileInfo.id}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                      >
                        <div className="flex-1 space-y-3">
                          {/* Header with Video Title and Favorite Button */}
                          <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                            <div className="max-w-[70%]">
                              <span className="text-xs font-medium text-gray-500">
                                Video Title
                              </span>
                              <p className="mt-0.5 text-gray-900 font-semibold text-2xl line-clamp-1">
                                {entry.videoTitle}
                              </p>
                            </div>
                            <button
                              onClick={() => handleFavorite(entry)}
                              disabled={loadingFavorite === entry.fileInfo.id}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                                favoritedItems.has(entry.fileInfo.id)
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                  : "text-yellow-600 hover:text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
                              }`}
                            >
                              {loadingFavorite === entry.fileInfo.id ? (
                                <svg
                                  className="animate-spin h-3 w-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <svg
                                  className="w-3 h-3"
                                  fill={
                                    favoritedItems.has(entry.fileInfo.id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                              )}
                              {favoritedItems.has(entry.fileInfo.id)
                                ? "Favorited"
                                : "Favorite"}
                            </button>
                          </div>

                          {/* Submitter Info */}
                          <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="text-xs font-medium text-gray-500">
                                Submitter
                              </span>
                              <p className="mt-0.5 text-gray-900 text-sm">{entry.name}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">
                                Email
                              </span>
                              <p className="mt-0.5 text-gray-900 text-sm truncate">{entry.email}</p>
                            </div>
                          </div>

                          {/* Adoption Status */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-500">
                              Adoption Status
                            </span>
                            <p className="mt-0.5 text-gray-900 text-sm">
                              {entry.isAdopted ? (
                                <span className="inline-flex items-center text-green-600">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Adopted Pet
                                </span>
                              ) : (
                                <span className="text-gray-600">Not Adopted</span>
                              )}
                            </p>
                          </div>

                          {/* Description */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-500">
                              Description
                            </span>
                            <p className="mt-0.5 text-gray-700 text-sm line-clamp-2">
                              {entry.description}
                            </p>
                          </div>

                          {/* Video Preview */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-500">
                              Video URL
                            </span>
                            <div className="mt-0.5">
                              {entry.uploadMethod == UploadType.link && (
                                <p className="text-gray-700 text-xs mb-1">
                                  <a
                                    href={entry.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                  >
                                    <span>View Link</span>
                                    <svg
                                      className="w-3 h-3 ml-1 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                </p>
                              )}
                              {entry.uploadMethod == UploadType.file && (
                                <VideoPreview
                                  videoName={entry.associatedVideo}
                                  videoTitle={entry.videoTitle}
                                  videoUrl={entry.videoUrl ?? ""}
                                  isLinkSubmission={false}
                                />
                              )}
                            </div>
                          </div>

                          {/* Status and Timestamp */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-500">
                              Submitted
                            </span>
                            <p className="mt-0.5 text-gray-700 text-xs">
                              {new Date(entry.submittedAt).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(entry.submittedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {/* Delete Button - Now at bottom of card */}
                        <div className="flex justify-end pt-2 border-t border-gray-100 mt-auto">
                          <button
                            onClick={() => handleDeleteClick(entry)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-md transition-colors font-semibold"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all duration-300 ease-out scale-100 opacity-100">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Video?</h3>
            <p className="text-gray-600 text-center mb-6">Are you sure? This can't be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SignedIn>
  );
} 