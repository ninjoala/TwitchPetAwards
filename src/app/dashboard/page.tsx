import { SignedIn, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import VideoPreview from '@/components/VideoPreview';

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

async function getMetadataEntries(): Promise<MetadataContent[]> {
  try {
    const response = await fetch('http://localhost:3000/api/list-metadata', {
      next: { revalidate: 60 } // Revalidate cache every minute
    });
    if (!response.ok) throw new Error('Failed to fetch metadata');
    return response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  const metadata = await getMetadataEntries();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.firstName || 'User'}!
              </h1>
              <UserButton afterSignOutUrl="/" />
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
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
                              {new Date(entry.submittedAt).toLocaleDateString()}
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