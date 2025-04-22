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
  try {
    const fileNext = await GET();
    if (!fileNext || !fileNext.body) {
      console.error('No response body from video files API');
      return null;
    }
    return fileNext;
  } catch (error) {
    console.error('Error fetching video files:', error);
    return null;
  }
}

export default async function Home() {
  let linkVideos = await getVideos();
  const videoFilesResponse = await getVideoFiles();
  
  if (videoFilesResponse && videoFilesResponse.body) {
    try {
      const videoFileString = await readStream(videoFilesResponse.body);
      const videoFiles = JSON.parse(videoFileString) as MetadataContent[];
      if (Array.isArray(videoFiles)) {
        linkVideos = MapVideoFilename(linkVideos, videoFiles);
      } else {
        console.error('Video files response is not an array:', videoFiles);
      }
    } catch (error) {
      console.error('Error processing video files:', error);
    }
  }
  
  return (
    <main className="container mx-auto p-4">
      <VoteForm initialVideos={linkVideos} />
    </main>
  );
}
