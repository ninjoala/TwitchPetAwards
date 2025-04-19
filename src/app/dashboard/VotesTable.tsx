'use client';

import { useState } from 'react';

interface Vote {
  id: number;
  userId: string;
  authProvider: string;
  VotedAtUtc: string;
  videoId: number;
  video: {
    id: number;
    Name: string;
    Streamer: string;
    URLSlug: string;
  };
}

interface Props {
  initialVotes: Vote[];
}

export default function VotesTable({ initialVotes }: Props) {
  const [votes] = useState<Vote[]>(initialVotes);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote ID</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streamer</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Provider</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voted At</th>
          </tr>
        </thead>
        <tbody>
          {votes.map((vote) => (
            <tr key={vote.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 border-b text-black">{vote.id}</td>
              <td className="px-6 py-4 border-b text-black">{vote.video?.Name || 'Unknown'}</td>
              <td className="px-6 py-4 border-b text-black">{vote.video?.Streamer || 'Unknown'}</td>
              <td className="px-6 py-4 border-b text-black">{vote.userId}</td>
              <td className="px-6 py-4 border-b text-black">{vote.authProvider}</td>
              <td className="px-6 py-4 border-b text-black">{new Date(vote.VotedAtUtc).toLocaleString()}</td>
            </tr>
          ))}
          {votes.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-black">
                No votes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 