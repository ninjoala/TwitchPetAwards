import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { GET } from '../api/list-metadata/route';
import DashboardContent from './DashboardContent';

async function getMetadataEntries() {
  try {
    const response = await GET();
    const data = response.json();
    if (!response.ok) throw new Error('Failed to fetch metadata');
    return data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const metadata = await getMetadataEntries();

  return <DashboardContent 
    initialMetadata={metadata} 
    userName={user.firstName}
    userId={user.id}
  />;
} 