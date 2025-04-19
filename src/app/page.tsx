import VoteForm from "@/app/voting/voteForm";
import supabase from "@/app/data/database";

export const revalidate = 3600; // Revalidate every hour

async function getVideos() {
  console.log('Fetching videos...');
  const { data, error } = await supabase
    .from('Videos')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
  
  console.log('Videos found:', data);
  return data;
}

export default async function Home() {
  const videos = await getVideos();
  console.log('Home page videos count:', videos?.length);
  
  return (
    <main className="container mx-auto p-4">
      <VoteForm initialVideos={videos} />
    </main>
  );
}
