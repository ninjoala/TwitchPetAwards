import VideoUploader from "@/components/VideoUploader";
import VideoList from "@/components/VideoList";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video Upload</h1>
      <VideoUploader />
      <VideoList />
    </main>
  );
}
