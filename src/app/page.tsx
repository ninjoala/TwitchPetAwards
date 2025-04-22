import VoteForm from "../app/voting/voteForm";
import supabase from "../app/data/database";
import { VideoEntry } from "../app/voting/videoEntry";
import React from "react";
import { GET, MetadataContent } from "../app/api/list-files/route";

export const revalidate = 3600; // Revalidate every hour

async function getVideos() {
  console.log('Fetching video links...');
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

function MapVideoFilename(entries: VideoEntry[], downloadedVids: MetadataContent[]): VideoEntry[] {
  const updatedVideos = entries.map(vid => {
    const metaDataForVideo = downloadedVids.find(x => x.fileInfo.name.includes(vid.Name));
    return {
      ...vid,
      URLSlug: null,
      URLDisplay: metaDataForVideo?.fileInfo.url,
    };
  })
  return updatedVideos;
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream?.getReader();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunkString = new TextDecoder().decode(value);
    result += chunkString;
  }

  return result;
}

async function getVideoFiles() {
  console.log("Fetching video files...");
  const fileNext = await GET();
  return fileNext;
}

export default async function Home() {
  let linkVideos = await getVideos();
  const videoFilesResponse = await getVideoFiles();
  if (videoFilesResponse.body != null) {
    const videoFileString = await readStream(videoFilesResponse.body);
    console.log(videoFileString);
    const videoFiles = JSON.parse(videoFileString) as MetadataContent[];
    console.log(videoFiles);
    linkVideos = MapVideoFilename(linkVideos, videoFiles);
    console.log(linkVideos);
  }  
  return (
    <main className="container mx-auto p-4">
      <VoteForm initialVideos={linkVideos} />
    </main>
  );
}
