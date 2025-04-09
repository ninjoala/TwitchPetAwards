import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

async function getMetadataEntries() {
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