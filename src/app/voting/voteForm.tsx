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
        <div>
            <div>
                {(rows.map((entry, index) => (
                    <div
                        key={entry.id}
                        className="bg-gray-50 p-6 rounded-lg"
                    >
                        <Checkbox
                            checked={voteChecked[index]}
                            onChange={(e) => handleVote(e, entry.id)}
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 32 } }}
                        />
                        <div className="space-y-4">
                            {/* Header with Video Title and Favorite Button */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Video Title
                                    </span>
                                    <p className="mt-1 text-gray-900 font-medium">
                                        {entry.title}
                                    </p>
                                </div>
                            </div>
        
                            {/* Description */}
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Description
                                </span>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                    {entry.description}
                                </p>
                            </div>
        
                            {/* Video Preview */}
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Video Link
                                </span>
                                <div className="mt-1">
                                    <iframe width="300" height="300" src={entry.url} />
                                </div>
                            </div>
                        </div>
                    </div>
                )))}
            </div>
            <div>
                <button onClick={ handleClick }>Submit Vote</button>
            </div>
    </div>
    );
}
