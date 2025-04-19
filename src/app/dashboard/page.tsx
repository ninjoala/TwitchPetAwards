import { Metadata } from "next";
import supabase from "@/app/data/database";
import VoteAggregatesTable from "./VoteAggregatesTable";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pet Awards Dashboard",
};

// Make this a dynamic route that fetches data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getVotes() {
  console.log('Starting to fetch votes...');
  
  const { data: votes, error: votesError } = await supabase
    .from('Votes')
    .select(`
      *,
      video:Videos(*)
    `)
    .order('id');
  
  console.log('Supabase query completed');
  console.log('Votes error:', votesError);
  console.log('Raw votes data:', votes);
    
  if (votesError) {
    console.error('Error fetching votes:', votesError);
    return [];
  }
  
  return votes;
}

export default async function DashboardPage() {
  console.log('DashboardPage: Starting to render');
  const votes = await getVotes();
  console.log('DashboardPage: Got votes, count:', votes?.length);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Vote Counts by Video</h2>
        <VoteAggregatesTable initialVotes={votes || []} />
      </div>
    </div>
  );
} 