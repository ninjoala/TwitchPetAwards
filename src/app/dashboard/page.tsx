import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { GET } from '../api/list-metadata/route';
import DashboardContent from './DashboardContent';

async function getMetadataEntries() {
  const startTime = performance.now();
  try {
    console.log('[PERF] Starting metadata fetch');
    const response = await GET();
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    const data = await response.json();
    
    // Ensure proper serialization of the data
    const processedData = data.map((entry: any) => ({
      ...entry,
      videoUrl: entry.videoUrl || null,
      uploadMethod: entry.associatedVideo?.startsWith('link_') ? 0 : 1
    }));
    
    const endTime = performance.now();
    console.log(`[PERF] Metadata fetch completed in ${(endTime - startTime).toFixed(2)}ms`);
    return processedData;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const startTime = performance.now();
  console.log('[PERF] Starting dashboard page load');
  
  const user = await currentUser();
  const userTime = performance.now();
  console.log(`[PERF] User authentication completed in ${(userTime - startTime).toFixed(2)}ms`);
  
  if (!user) {
    redirect('/sign-in');
  }

  const metadata = await getMetadataEntries();
  const metadataTime = performance.now();
  console.log(`[PERF] Total page load time: ${(metadataTime - startTime).toFixed(2)}ms`);

  return <DashboardContent 
    initialMetadata={metadata} 
    userId={user.id}
  />;
} 