'use client'
import { useState, useEffect, useMemo } from "react";
import supabase from "../data/database";
import { useAuth, useUser } from "@clerk/nextjs";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
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
        if (hasVoted) return;
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
        <div className="max-w-4xl mx-auto px-0 sm:px-6 py-8">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 sm:mb-8 md:mb-12 text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                Vote for The Pet Awards Clip of the Year!
            </h1>
            {hasVoted && (
                <div className="mb-6 sm:mb-8 p-4 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-center">
                    <p className="text-white text-base sm:text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">You have already cast your vote. Thank you for participating!</p>
                </div>
            )}
            <div className="space-y-8 sm:space-y-12">
                {streamerVideos.map((streamerGroup) => (
                    <div key={streamerGroup.streamer} className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-stretch px-4 sm:px-0">
                            <button
                                onClick={() => handleVote(streamerGroup.videos[0].id)}
                                disabled={hasVoted}
                                className={`flex-1 flex items-center p-3 sm:p-4 rounded-lg transition-all duration-200 border-2 border-white ${
                                    streamerGroup.videos.some(v => v.id === voteId)
                                        ? 'bg-[#9146FF] hover:bg-[#7F3FE0]'
                                        : 'bg-[#fdb000] hover:bg-[#e69f00]'
                                }`}
                            >
                                <h2 className={`text-xl sm:text-2xl font-bold flex-grow ${
                                    streamerGroup.videos.some(v => v.id === voteId)
                                        ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]'
                                        : 'text-[#1F1F1F]'
                                }`}>
                                    Vote for {streamerGroup.streamer}
                                </h2>
                                {streamerGroup.videos.some(v => v.id === voteId) && (
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                            {streamerGroup.videos.some(v => v.id === voteId) && (
                                !isSignedIn ? (
                                    <SignInButton mode="modal" fallbackRedirectUrl={pathname}>
                                        <button className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-lg sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-lg border-2 border-white/80 shadow-lg hover:scale-105 transition-all duration-200">
                                            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Sign in to vote</span>
                                        </button>
                                    </SignInButton>
                                ) : !hasVoted && (
                                    <button 
                                        onClick={handleSubmit}
                                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-lg sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-lg border-2 border-white/80 shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Submit Vote</span>
                                    </button>
                                )
                            )}
                        </div>
                        
                        {streamerGroup.videos.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white rounded-lg shadow-lg border-x-0 sm:border border-gray-200 transition-all duration-200"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 px-6 pt-6 pb-4">
                                    {video.Name}
                                </h3>
                                <div className="mx-0 sm:mx-6">
                                    <div className="relative pb-[75%] sm:pb-[66.67%] h-0">
                                        <iframe 
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://clips.twitch.tv/embed?clip=${video.URLSlug}&parent=${hostname}&protocol=http`}
                                            title={video.Name}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                                <div className="h-6"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                {process.env.NODE_ENV === 'development' && isSignedIn && (
                    <div className="mb-4">
                        <SignOutButton>
                            <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200">
                                Sign Out (Dev Only)
                            </button>
                        </SignOutButton>
                    </div>
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
                        <h3 className={`text-xl font-bold text-center mb-2 ${dialogType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {dialogType === 'success' ? 'Success!' : 'Error'}
                        </h3>
                        <p className="text-gray-800 text-center mb-6">{dialogMessage}</p>
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
