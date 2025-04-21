'use client'
import { useState, useEffect, useMemo } from "react";
import supabase from "../data/database";
import { useAuth, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';

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
    const { userId, isSignedIn } = useAuth();
    const { user } = useUser();
    const [voteId, setVoteId] = useState<number | null>(null);
    const [hostname, setHostname] = useState<string>('localhost');
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogType, setDialogType] = useState<'success' | 'error'>('success');
    const [dialogMessage, setDialogMessage] = useState<string>('');
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const pathname = usePathname();

    // Group videos by streamer
    const streamerVideos = useMemo(() => {
        const grouped = initialVideos.reduce((acc: { [key: string]: VideoEntry[] }, video) => {
            if (!acc[video.Streamer]) {
                acc[video.Streamer] = [];
            }
            acc[video.Streamer].push(video);
            return acc;
        }, {});

        return Object.entries(grouped).map(([streamer, videos]) => ({
            streamer,
            videos
        }));
    }, [initialVideos]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            setHostname(host);
        }
    }, []);

    useEffect(() => {
        const checkIfVoted = async () => {
            if (!userId) return;
            
            const { data, error } = await supabase
                .from('Votes')
                .select('id')
                .eq('userId', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking vote status:', error);
                return;
            }

            setHasVoted(!!data);
        };

        if (isSignedIn) {
            checkIfVoted();
        }
    }, [isSignedIn, userId]);

    const handleVote = (videoId: number) => {
        if (!isSignedIn || hasVoted) return;
        setVoteId(videoId === voteId ? null : videoId);
    };

    const handleSubmit = async () => {
        if (!voteId || !userId) return;
        
        try {
            const { error } = await supabase
                .from('Votes')
                .insert({ 
                    userId,
                    Email: user?.primaryEmailAddress?.emailAddress,
                    VotedAtUtc: new Date(), 
                    videoId: voteId 
                });

            if (error) throw error;

            setDialogType('success');
            setDialogMessage('Your vote has been successfully submitted!');
            setShowDialog(true);
            
            setVoteId(null);
            setHasVoted(true);
        } catch (error) {
            console.error('Error submitting vote:', error);
            setDialogType('error');
            setDialogMessage('There was an error submitting your vote. Please try again.');
            setShowDialog(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-12 text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                Vote for The Pet Awards Clip of the Year!
            </h1>
            {hasVoted && (
                <div className="mb-8 p-4 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-center">
                    <p className="text-white text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">You have already cast your vote. Thank you for participating!</p>
                </div>
            )}
            <div className="space-y-12">
                {streamerVideos.map((streamerGroup) => (
                    <div key={streamerGroup.streamer} className="space-y-4">
                        <button
                            onClick={() => handleVote(streamerGroup.videos[0].id)}
                            disabled={hasVoted || !isSignedIn}
                            className={`w-full flex items-center p-4 rounded-lg transition-all duration-200 ${
                                streamerGroup.videos.some(v => v.id === voteId)
                                    ? 'bg-[#9146FF] hover:bg-[#7F3FE0] border-2 border-white'
                                    : 'bg-[#1F1F1F] hover:bg-[#2D2D2D] border-2 border-transparent'
                            }`}
                        >
                            <h2 className="text-2xl font-bold text-white flex-grow">
                                Vote for {streamerGroup.streamer}
                            </h2>
                            {streamerGroup.videos.some(v => v.id === voteId) && (
                                <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        
                        {streamerGroup.videos.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-200"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    {video.Name}
                                </h3>
                                <div className="relative pb-[56.25%] h-0">
                                    <iframe 
                                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                                        src={`https://clips.twitch.tv/embed?clip=${video.URLSlug}&parent=${hostname}&protocol=http`}
                                        title={video.Name}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                {!isSignedIn ? (
                    <div className="space-y-4">
                        <p className="text-white">Please sign in to cast your vote</p>
                        <SignInButton mode="modal" fallbackRedirectUrl={pathname}>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Sign in to vote
                            </button>
                        </SignInButton>
                    </div>
                ) : hasVoted ? (
                    <div className="space-y-4">
                        <p className="text-white">You have already cast your vote</p>
                    </div>
                ) : (
                    <button 
                        onClick={handleSubmit}
                        disabled={!voteId}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Submit Vote
                    </button>
                )}
            </div>

            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-center mb-4">
                            {dialogType === 'success' ? (
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 className={`text-xl font-bold text-center mb-2 ${dialogType === 'success' ? 'text-white' : 'text-red-600'}`}>
                            {dialogType === 'success' ? 'Success!' : 'Error'}
                        </h3>
                        <p className="text-white text-center mb-6">{dialogMessage}</p>
                        <button
                            onClick={() => setShowDialog(false)}
                            className={`w-full py-2 px-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                                dialogType === 'success' 
                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            }`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
