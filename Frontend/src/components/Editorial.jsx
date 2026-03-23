import { useEffect, useRef, useState } from "react";
import axiosClient from "../utils/axiosClient";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css"; // Importing Plyr's CSS styles
import { useSelector } from "react-redux";

// --- MARKDOWN & HIGHLIGHTING IMPORTS ---
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- IMPORT THE LOCK COMPONENT ---
import PremiumLock from "./PremiumLock"; // <--- Import the Lock UI

function Editorial({ problemId }){
    // A useRef to point/refer to the video tag
    const videoRef = useRef(null);
    // For storing the video details (URL, title, desc) fetched from the backend. Initial is null because we have no data yet.
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State to track if the video has started playing
    const [hasStarted, setHasStarted] = useState(false);
    
    const hlsRef = useRef(null);
    // A useRef to point/refer the Plyr instance that we’ll create below
    const playerRef = useRef(null);

    // GET USER DETAILS FROM REDUX 
    const { user } = useSelector((state) => state.auth);
    // CALCULATE LOCK STATUS 
    const isPremium = user?.subscription?.status === 'premium';
    const validUntil = user?.subscription?.validUntil;
    const isExpired = validUntil ? new Date() > new Date(validUntil) : false;
    // Locked if NOT premium OR if premium is EXPIRED
    const isLocked = !isPremium || isExpired;

    // --- FETCH VIDEO DATA ---
    useEffect(() => {
        // Check if problemId exists; if not, simply return
        if (!problemId) return;

        // If the user is locked, DO NOT attempt to fetch the video.
        if (isLocked) {
            return;
        }

        let isMounted = true;
        async function fetchVideo(){
            try {
                setLoading(true);
                setError(null);
                setHasStarted(false); 
                
                const response = await axiosClient.get(`/video/getVideo/${problemId}`);
                if(isMounted){
                    setVideoData(response.data);
                }
            } 
            catch (err) {
                if(isMounted){
                    const status = err.response?.status;
                    const errorMessage = err.response?.data;

                    if (status === 404 || (status === 500 && errorMessage === "Failed to fetch video solution")) {
                        setVideoData(null);
                    } 
                    else {
                        setError("Unable to load video solution.");
                    }
                }
            } 
            finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchVideo();

        // Cleanup Function
        return () => {isMounted = false};
    }, [problemId, isLocked]);

    // useEffect to setup hls.js and Plyr.
    // This runs only after 'videoData' is successfully fetched
    useEffect(() => {
        // Don't run if we have no video URL or if the <video> tag isn't rendered yet
        if (!videoData?.videoUrl || !videoRef.current) return;

        const source = videoData.videoUrl; // Store the playbackUrl in a variable called `source`

        // Configure Plyr
        const defaultOptions = {
            // Defines which buttons and UI elements should appear in the player
            // Note: The sequence you define here determines the order in which options appear in the UI
            controls: [
                'play-large', 'rewind', 'play', 'fast-forward', 
                'progress', 'current-time', 'duration', 'mute', 
                'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
            ],
            // Defines what options should appear in the ⚙️ settings menu
            settings: ['quality', 'speed'],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
            // How many seconds should rewind / forward skip?
            seekTime: 10,
            // Controls keyboard shortcuts
            // focused: true --> Keyboard shortcuts work when the player is focused
            // global: true --> Keyboard shortcuts also work even if player is NOT focused (like YouTube)
            keyboard: { focused: true, global: true },
            // Auto-hides controls when the user is not interacting (like YouTube).
            hideControls: true, 
            // Adds helpful hover tooltips
            // controls: true --> Show tooltips when hovering over buttons
            // seek: true --> When hovering over progress bar, show preview time
            tooltips: { controls: true, seek: true }
        };

        const setupPlayer = (player) => {
            playerRef.current = player;
            player.on('play', () => setHasStarted(true));
        };

        if (Hls.isSupported()) {
            hlsRef.current = new Hls();
            hlsRef.current.loadSource(source);
            // Now that Hls.js has the .m3u8 playlist, it scans it and figures out which streaming qualities are available—like 
            // 1080p, 720p, 480p, and 360p (MANIFEST_PARSED)
            // Once the scanning is complete, execute the corresponding callback function
            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                // Extract available qualities (heights like 1080, 720) from the .m3u8 playlist
                const availableQualities = hlsRef.current.levels.map((l) => l.height);
                availableQualities.unshift(0); // Add '0' to represent "Auto" quality
                
                // Initialize Plyr --> Hey Plyr, here’s the <video> tag. Decorate it.
                const player = new Plyr(videoRef.current, {
                    ...defaultOptions,
                    quality: {
                        default: 0, // Default to Auto
                        options: availableQualities,
                        forced: true, 
                        onChange: (newQuality) => {
                            // ADAPTIVE BITRATE STREAMING (ABR)
                            if (newQuality === 0) {
                                // If the user selects Auto Quality, then hls.js will automatically download the next
                                // chunk/segment in the most suitable quality based on the user’s internet speed
                                hlsRef.current.nextLevel = -1 // -1 means ANY quality; 
                            } 
                            else {
                                // MANUAL QUALITY SWITCHING
                                // levels  → This is an array containing all the quality variants detected by hls.js from the .m3u8 file.
                                // It stores the qualities in the form of indexes  -->
                                //      Lowest Resolution (360p)    480p           720p       Highest Resolution (1080p)
                                //                        |          |              |             |
                                // Levels Array --> [levelIndex0, levelIndex1, levelIndex2, levelIndex3]
                                hlsRef.current.levels.forEach((level, levelIndex) => {
                                    if (level.height === newQuality) {
                                        // hls.js will download the next chunk/segment in the quality selected (levelIndex)
                                        hlsRef.current.nextLevel = levelIndex;
                                    }
                                });
                            }
                        },
                    },
                    i18n: { qualityLabel: { 0: 'Auto' } }, // Rename '0' to 'Auto' in the UI
                });
                setupPlayer(player);
            });
            hlsRef.current.attachMedia(videoRef.current); // Connect the hls engine to the <video> tag
        } 
        else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Just set the src directly. Safari doesn't need Hls.js. It reads .m3u8 natively.
            videoRef.current.src = source;
            const player = new Plyr(videoRef.current, defaultOptions);
            setupPlayer(player);
        } 

        // Cleanup function
        // When component unmounts (user leaves), destroy the player and HLS instance to free up memory.
        return () => {
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
        };
    }, [videoData]);

    // RENDER THE LOCK UI
    // If the user is Locked, return the PremiumLock Component immediately
    if (isLocked) {
        return (
            <PremiumLock title="Video Editorial" />
        );
    }
    
    // --- NORMAL RENDERING (For Premium Users) ---
    // If loading, show spinner
    if (loading) return <div className="editorial-loader"><div className="SPINNER"></div></div>;
    // If error, show error message
    if (error) return <div className="editorial-error"><i className="ri-error-warning-line"></i> {error}</div>;
    // If no video data (and no error), show the "No Solution" empty state
    if (!videoData) return (
        <div className="editorial-empty">
            <i className="ri-video-off-line"></i>
            <h3>No Solution Video</h3>
            <p>We haven't uploaded a video solution for this problem yet.</p>
        </div>
    );

    return (
        <div className="editorial-container fade-in-editorial">
            <div className="editorial-header">
                <h2 className="video-title">{videoData.title}</h2>
                <div className="video-meta">
                    <span>
                        <i className="ri-time-line"></i> 
                        {Math.floor(videoData.duration / 60)}m {Math.floor(videoData.duration % 60)}s
                    </span>
                    <span>
                        <i className="ri-eye-line"></i> 
                        {videoData.views} views
                    </span>
                </div>
            </div>

            <div className={`video-wrapper2 ${hasStarted ? 'video-started' : 'video-initial'}`}>
                <video 
                    ref={videoRef} 
                    className="plyr-video" 
                    poster={videoData.thumbnail} 
                    crossOrigin="anonymous" 
                    playsInline
                />
            </div>

            <div className="video-description">
                <h3>Approach & Explanation</h3>
                <div className="markdown-content">
                    <ReactMarkdown
                        components={{
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                const value = String(children).replace(/\n$/, '')
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={atomDark}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, borderRadius: '12px' }}
                                    >
                                        {value}
                                    </SyntaxHighlighter>
                                ) : (
                                    // Inline code (e.g. `a+b`) styling
                                    <code className="inline-code" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {videoData.desc}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default Editorial;