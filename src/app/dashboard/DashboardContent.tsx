'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import VideoPreview from '@/components/VideoPreview';
import { useState, useEffect } from 'react';
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
}

export default function DashboardContent({ 
  initialMetadata, 
  userName,
  userId 
}: { 
  initialMetadata: MetadataContent[],
  userName: string | null,
  userId: string 
}) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [metadata, setMetadata] = useState(initialMetadata);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { startUpload: startFavoriteUpload } = useUploadThing("favoritesUploader");
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());
  const [loadingFavorite, setLoadingFavorite] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Fetch favorites when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/list-favorites?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const favoriteIds = await response.json();
        setFavoritedItems(new Set(favoriteIds));
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

  const filteredMetadata = showFavoritesOnly
    ? metadata.filter(entry => favoritedItems.has(entry.fileInfo.id))
    : metadata;

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50">
        {notification && (
          <div 
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {notification.message}
          </div>
        )}
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
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">
                      {showFavoritesOnly ? 'Favorite Videos' : 'Recent Submissions'}
                    </h2>
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                        showFavoritesOnly
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'text-yellow-600 hover:text-yellow-700 border border-yellow-200 hover:bg-yellow-50'
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
                      {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
                    </button>
                  </div>
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
                  {filteredMetadata.length === 0 ? (
                    <p className="text-gray-500">
                      {showFavoritesOnly 
                        ? 'No favorite videos yet. Click the star icon on any video to add it to your favorites!'
                        : 'No submissions found.'}
                    </p>
                  ) : (
                    filteredMetadata.map((entry) => (
                      <div key={entry.fileInfo.id} className="bg-gray-50 p-6 rounded-lg">
                        <div className="space-y-4">
                          {/* Header with Video Title and Favorite Button */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Video Title</span>
                              <p className="mt-1 text-gray-900 font-medium">{entry.videoTitle}</p>
                            </div>
                            <button
                              onClick={() => handleFavorite(entry)}
                              disabled={loadingFavorite === entry.fileInfo.id}
                              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                                favoritedItems.has(entry.fileInfo.id)
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                  : 'text-yellow-600 hover:text-yellow-700 border border-yellow-200 hover:bg-yellow-50'
                              }`}
                            >
                              {loadingFavorite === entry.fileInfo.id ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg 
                                  className="w-4 h-4" 
                                  fill={favoritedItems.has(entry.fileInfo.id) ? "currentColor" : "none"} 
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
                              {favoritedItems.has(entry.fileInfo.id) ? 'Favorited' : 'Favorite'}
                            </button>
                          </div>

                          {/* Submitter Name */}
                          <div>
                            <span className="text-sm font-medium text-gray-500">Submitter Name</span>
                            <p className="mt-1 text-gray-900">{entry.name}</p>
                          </div>

                          {/* Submitter Email */}
                          <div>
                            <span className="text-sm font-medium text-gray-500">Submitter Email</span>
                            <p className="mt-1 text-gray-900">{entry.email}</p>
                          </div>

                          {/* Description */}
                          <div>
                            <span className="text-sm font-medium text-gray-500">Description</span>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{entry.description}</p>
                          </div>

                          {/* Video Preview */}
                          <div>
                            <span className="text-sm font-medium text-gray-500">Video Preview</span>
                            <div className="mt-1">
                              <p className="text-gray-700 text-sm mb-2">{entry.associatedVideo}</p>
                              {entry.videoUrl && (
                                <VideoPreview 
                                  videoName={entry.associatedVideo}
                                  videoTitle={entry.videoTitle}
                                  videoUrl={entry.videoUrl}
                                />
                              )}
                            </div>
                          </div>

                          {/* Status and Timestamp */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Submitted</span>
                              <p className="mt-1 text-gray-700">
                                {new Date(entry.submittedAt).toLocaleDateString()} at{' '}
                                {new Date(entry.submittedAt).toLocaleTimeString()}
                              </p>
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