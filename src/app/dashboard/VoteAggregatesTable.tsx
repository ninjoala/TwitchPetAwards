'use client';

import { useState, useMemo } from 'react';

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

interface VoteAggregate {
  videoId: number;
  videoName: string;
  streamer: string;
  voteCount: number;
}

interface Props {
  initialVotes: Vote[];
}

export default function VoteAggregatesTable({ initialVotes }: Props) {
  const [votes] = useState<Vote[]>(initialVotes);

  const aggregates = useMemo(() => {
    const aggregateMap = new Map<number, VoteAggregate>();

    votes.forEach(vote => {
      if (!vote.video) return;

      const existing = aggregateMap.get(vote.videoId);
      if (existing) {
        existing.voteCount++;
      } else {
        aggregateMap.set(vote.videoId, {
          videoId: vote.videoId,
          videoName: vote.video.Name,
          streamer: vote.video.Streamer,
          voteCount: 1
        });
      }
    });

    return Array.from(aggregateMap.values())
      .sort((a, b) => b.voteCount - a.voteCount); // Sort by vote count descending
  }, [votes]);

  return (
    <div className="overflow-x-auto text-black">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">Video</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">Streamer</th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium uppercase tracking-wider">Vote Count</th>
          </tr>
        </thead>
        <tbody>
          {aggregates.map((aggregate) => (
            <tr key={aggregate.videoId} className="hover:bg-gray-50">
              <td className="px-6 py-4 border-b">{aggregate.videoName}</td>
              <td className="px-6 py-4 border-b">{aggregate.streamer}</td>
              <td className="px-6 py-4 border-b font-semibold">{aggregate.voteCount}</td>
            </tr>
          ))}
          {aggregates.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center">
                No votes found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 