'use client'
import { Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import supabase from "../data/database";

interface VideoEntry {
    id: number;
    Name: string;
    Streamer: string;
    URLSlug: string;
}

interface Props {
    initialVideos: VideoEntry[];
}

export default function VoteForm({ initialVideos }: Props) {
    const [voteId, setVoteId] = useState<number | null>(null);
    const [voteChecked, setVoteChecked] = useState<boolean[]>(new Array(initialVideos.length).fill(false));
    const [hostname, setHostname] = useState<string>('localhost');

    useEffect(() => {
        setHostname(window.location.hostname);
    }, []);

    const handleVote = (event: React.ChangeEvent<HTMLInputElement>, entryId: number) => {
        if (event.target.checked === true && voteId != null && entryId != voteId) {
            return;
        }

        if (event.target.checked === true) {
            setVoteId(entryId);
            setVoteChecked(prev => prev.map((_, idx) => initialVideos[idx].id === entryId));
        } else {
            setVoteId(null);
            setVoteChecked(new Array(initialVideos.length).fill(false));
        }
    }

    const handleClick = async () => {
        if (!voteId) return;
        
        console.log("Inserting To table");
        console.log(voteId);
        await supabase
            .from('Votes')
            .insert({ Email: "ryu_h_phino@yahoo.com", VotedAtUtc: new Date(), videoId: voteId });
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Vote for Your Favorite Video</h1>
            <div className="space-y-6">
                {initialVideos.map((entry, index) => (
                    <div
                        key={entry.id}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-start space-x-4">
                            <Checkbox
                                checked={voteChecked[index]}
                                onChange={(e) => handleVote(e, entry.id)}
                                sx={{ 
                                    '& .MuiSvgIcon-root': { fontSize: 32 },
                                    '&.Mui-checked': { color: '#3B82F6' }
                                }}
                            />
                            <div className="flex-1 space-y-4">
                                {/* Header with Video Title and Streamer */}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Video Title
                                    </span>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {entry.Name}
                                    </p>
                                    <span className="text-sm font-medium text-gray-500 mt-2 block">
                                        Streamer
                                    </span>
                                    <p className="mt-1 text-gray-700">
                                        {entry.Streamer}
                                    </p>
                                </div>
            
                                {/* Video Preview */}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Video Preview
                                    </span>
                                    <div className="mt-2 relative pb-[56.25%] h-0">
                                        <iframe 
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            src={`https://clips.twitch.tv/embed?clip=${entry.URLSlug}&parent=${hostname}`}
                                            title={entry.Name}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button 
                    onClick={handleClick}
                    disabled={!voteId}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Submit Vote
                </button>
            </div>
        </div>
    );
}
