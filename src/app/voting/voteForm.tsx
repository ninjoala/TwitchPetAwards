'use client'
import { Checkbox } from "@mui/material";
import { useState, useEffect } from "react";
import supabase from "../data/database";

export default function VoteForm() {
    const [voteId, setVoteId] = useState<number | null>(null);
    const [voteChecked, setVoteChecked] = useState<boolean[]>([false, false, false]);

    const handleVote = (event: React.ChangeEvent<HTMLInputElement>, entryId: number) => {
        if (event.target.checked === true && voteId != null && entryId != voteId) {
            return;
        }

        if (event.target.checked === true) {
            setVoteId(entryId);

            if (entryId === 2) {
                setVoteChecked([true, false, false]);
            }
            else if(entryId === 3) {
                setVoteChecked([false, true, false]);
            }
            else {
                setVoteChecked([false, false, true]);
            }
        }
        else {
            setVoteId(null);
            setVoteChecked([false, false, false]);
        }
    }

    const handleClick = async () => {
        const getResults = await supabase.from('Videos').select();

        if (getResults.data?.length === 0)
        {
            await supabase.from("Videos").insert([
              { Name: "Smooth Mcgroove", Description: "some good music" },
              { Name: "Tyler The Creator", Description: "dat rap" },
              {
                Name: "BlueCoats",
                Description: "Tilt is the best of all time. come at me",
              },
            ]);
        }
        console.log("Inserting To table");
        console.log(voteId);
        await supabase
            .from('Votes')
            .insert({ Email: "ryu_h_phino@yahoo.com", VotedAtUtc: new Date(), videoId: voteId });
    }

    useEffect(() => {
        console.log(voteId);
        console.log(voteChecked);
    }, [voteId, voteChecked]);
    
    const rows = [
      {
        checked: false,
        id: 2,
        url: "https://www.youtube.com/embed/LzFD9yFi7PY?si=5Llior76kErIzi3w",
        title: "Smooth Mcgroove",
        description: "some good music",
      },
      {
        checked: false,
        id: 3,
        url: "https://www.youtube.com/embed/mKzg_ZdDSRc?si=KYsuMdo0X_uTj6PE",
        title: "Tyler The Creator",
        description: "dat rap",
      },
      {
        checked: false,
        id: 4,
        url: "https://www.youtube.com/embed/ulLI9MtkA-s?si=lAUr5SJnoA5-M6ja",
        title: "BlueCoats",
        description: "Tilt is the best of all time. come at me",
      },
    ];
    
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Vote for Your Favorite Video</h1>
            <div className="space-y-6">
                {rows.map((entry, index) => (
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
                                {/* Header with Video Title */}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Video Title
                                    </span>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {entry.title}
                                    </p>
                                </div>
            
                                {/* Description */}
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Description
                                    </span>
                                    <p className="mt-1 text-gray-700">
                                        {entry.description}
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
                                            src={entry.url}
                                            title={entry.title}
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
