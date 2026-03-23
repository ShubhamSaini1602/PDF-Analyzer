import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useDropzone } from "react-dropzone";
// Our axiosClient is configured only for communicating with our own backend (Node.js/Express). 
// It is not meant for calling any external third-party APIs.
import axiosClient from "../utils/axiosClient";
// On the other hand, we are importing this raw axios instance because we can use it
// to communicate with external third-party APIs like Cloudinary, Google Maps, etc.
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

function UploadVideo() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    // Stores the actual File object selected by the user.
    const [file, setFile] = useState(null);
    // Stores a Blob/Preview URL so we can show a video preview WITHOUT uploading the file first.
    const [previewUrl, setPreviewUrl] = useState("");
    // Stores technical details (Resolution, Duration) extracted locally from the file.
    // This allows us to show  For E.g., "1920x1080 and 30s" to the user before they even click upload.
    const [videoMeta, setVideoMeta] = useState({ width: 0, height: 0, duration: 0 });
    // Form Inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    // Upload Progress: Tracks the percentage (0-100) for the progress bar.
    const [uploadProgress, setUploadProgress] = useState(0);
    // 'idle'      -> Waiting for user input
    // 'uploading' -> Sending bytes to Cloudinary
    // 'processing'-> Saving data to MongoDB
    // 'success'   -> Done!
    const [status, setStatus] = useState("idle"); 
    // Stores the problem Title (e.g., "Two Sum")
    const [problemName, setProblemName] = useState("");

    // --- FETCH PROBLEM DETAILS ---
    useEffect(() => {
        async function fetchProblem() {
            try {
                const response = await axiosClient.get(`/problem/getProblem/${problemId}`);
                setProblemName(response.data.title);
            } 
            catch (err) {
                toast.error("Could not load problem details.");
            }
        }
        fetchProblem();
    }, [problemId]); // Runs whenever problemId changes

    // --- MEMORY CLEANUP ---
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // --- SUCCESS NAVIGATION HANDLER ---
    // Automatically redirect after successful upload, with proper cleanup
    useEffect(() => {
        let timeoutId;
        if (status === 'success') {
            timeoutId = setTimeout(() => {
                navigate("/adminPanel/videoManagement");
            }, 2000);
        }
        return () => {
            if (timeoutId){
                clearTimeout(timeoutId);
            }
        };
    }, [status, navigate]);

    // --- FORMAT DURATION ---
    // Converts raw seconds (e.g., 125s) into a readable format (e.g., "2:05 min").
    const formatDuration = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    // --- HANDLE FILE DROP ---
    // 'useCallback' prevents this function from being recreated on every render (performance optimization).
    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];

        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setFile(selectedFile);
            setPreviewUrl(objectUrl);

            if(!title){
                setTitle(`Solution for ${problemName}`);
            }

            const video = document.createElement("video");
            video.src = objectUrl;
            video.onloadedmetadata = () => {
                setVideoMeta({
                    width: video.videoWidth,
                    height: video.videoHeight,
                    duration: video.duration,
                });
                video.remove();
            };

            video.onerror = () => {
                toast.error("Could not read video metadata. File may be corrupted.");
                video.remove();
            };
        }
    }, [problemName,title]);

    // Configure Dropzone
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: { 
            'video/mp4': [], 
            'video/quicktime': [], 
            'video/x-matroska': []
        },
        maxSize: 100 * 1024 * 1024, // 100MB Limit
        multiple: false,
        disabled: status === 'uploading' || status === 'processing'
    });

    // --- MAIN UPLOAD LOGIC ---
    const handleUpload = async () => {
        // Validation: Don't let them submit empty forms
        if (!file || !title) {
            return toast.error("Please fill in all required fields.");
        }

        try {
            setStatus("uploading");

            // Step 1: Get Digital Signature from Backend
            const response = await axiosClient.get(`/video/createSignature/${problemId}`);
            const signData = response.data;
            
            // Step 2: Prepare Data for Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signData.api_key);
            formData.append("timestamp", signData.timestamp);
            formData.append("signature", signData.signature);
            formData.append("public_id", signData.public_id);
            formData.append("eager", signData.eager);
            formData.append("eager_async", signData.eager_async);
            formData.append("format", signData.format);

            // Step 3: Upload Video Directly to Cloudinary
            const cloudRes = await axios.post(signData.upload_url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (p) => {
                    if (p.total) {
                        const percent = Math.round((p.loaded * 100) / p.total);
                        setUploadProgress(percent);
                    }
                }
            });

            // Step 4: Save Metadata to MongoDB
            setStatus("processing");
            await axiosClient.post("/video/save", {
                problemId,
                title,
                description,
                cloudinaryPublicId: cloudRes.data.public_id,
                duration: cloudRes.data.duration,
                format: cloudRes.data.format,
                size: cloudRes.data.bytes,
            });

            setStatus("success");
            toast.success("Video Uploaded Successfully!");

        } 
        catch (error) {
            console.log(error);
            setStatus("idle");
            setUploadProgress(0);
            // Error handling for the specific case where the Digital Signature API reports that a video solution already exists.
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error.message);
            } 
            // Error Handling for other errors
            else {
                toast.error("Upload failed. Check console.");
            }
        }
    };

    // Helper to --> Remove the preview File
    const removeFile = () => {
        if (status === 'uploading') return; // Prevent removal during upload
        setFile(null);
        setPreviewUrl("");
        setUploadProgress(0);
        setVideoMeta({ width: 0, height: 0, duration: 0 });
    };

    return (
        <div className="upload-page-wrapper">
            {/* Toaster Configuration */}
            <Toaster
                position="top-right"
                gutter={8}
                toastOptions={{
                    className: "",
                    duration: 5000,
                    // BASE STYLING --> Applied to all toasters
                    style: {
                        // GLASSMORPHISM BACKGROUND
                        background: 'rgba(30, 41, 59, 0.85)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)', // Safari support
                        // TYPOGRAPHY & LAYOUT
                        color: '#f8fafc',
                        fontSize: '14px',
                        fontFamily: "Figtree, sans-serif",
                        fontWeight: '500',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        // BORDER & DEPTH
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#a855f7',
                            secondary: '#fff',
                        },
                        style: {
                            borderLeft: '4px solid #a855f7',
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        style: {
                            borderLeft: '4px solid #ef4444',
                        }
                    },
                    loading: {
                        iconTheme: {
                            primary: '#3b82f6',
                            secondary: '#fff',
                        },
                    }
                }}
            />

            {/* Header */}
            <div className="upload-header">
                {/* navigate(-1) means: Go one step back in the browser history */}
                <button onClick={() => navigate(-1)} className="nav-back-btn">
                    <i className="ri-arrow-left-s-line"></i> Back
                </button>
                <div className="header-text">
                    <div className="mera-div">
                        <img src="/upload-video-image.png" className="upload-video-image"></img>
                        <h1>Upload Video Solution</h1>
                    </div>
                    <div className="problem-badge">
                        📌 {problemName}
                    </div>
                </div>
            </div>

            <div className="upload-grid-layout">
                {/* LEFT: Upload Area */}
                <div>
                    {!file ? (
                        // If File is not selected yet, show this div
                        <div {...getRootProps()} className={`dropzone-area ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''}`}>
                            <input {...getInputProps()} />
                            <div className="dropzone-inner">
                                <i className="ri-upload-cloud-2-fill icon-glow"></i>
                                <h3>Drag & Drop Video</h3>
                                <p style={{color: 'var(--text-muted)'}}>MP4, MKV, MOV (Max 100MB)</p>
                                <button className="browse-btn">Browse Files</button>
                            </div>
                        </div>
                    ) : (
                        // Else show this div
                        <div className="video-preview-container">
                            <div className="video-wrapper">
                                <video src={previewUrl} controls className="preview-player" />
                                <div className="video-overlay-info">
                                    <span className="info-tag">{videoMeta.width}x{videoMeta.height}</span>
                                    <span className="info-tag">{formatDuration(videoMeta.duration)}</span>
                                </div>
                            </div>
                            <div className="file-status-bar">
                                <div className="file-info-text">
                                    <i className="ri-file-video-line"></i>
                                    <div>
                                        <p className="filename">{file.name}</p>
                                        <p className="filesize">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {status === 'idle' && (
                                    <button onClick={removeFile} className="remove-icon-btn">
                                        <i className="ri-delete-bin-line"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Details Form */}
                <div className="upload-right">
                    <div className="form-card">
                        <h2>Video Details</h2>
                        
                        {/* Title */}
                        <div className="mera-input-group">
                            <label>Video Title</label>
                            <div className="mera-input-wrapper">
                                <i className="ri-text mera-input-icon"></i>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Optimized Solution using HashMap" 
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    disabled={status !== 'idle'} 
                                />
                            </div>
                        </div>

                        {/* Description → Always write content in Markdown format so it renders beautifully
                        in the Editorial section using react-markdown inside Editorial.jsx */}
                        <div className="mera-input-group">
                            <label>Description</label>
                            <textarea 
                                placeholder="Explain the approach..."
                                rows="5"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={status !== 'idle'}
                            ></textarea>
                        </div>

                        {/* Status Indicators */}
                        {status === 'uploading' && (
                            <div className="upload-status-box">
                                <div className="progress-header">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {status === 'processing' && (
                            <div className="processing-box">
                                <i className="ri-loader-4-line spin-icon"></i>
                                <span>Saving metadata to Database...</span>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="success-box">
                                <i className="ri-check-double-line"></i>
                                <span>Upload Complete! Redirecting...</span>
                            </div>
                        )}

                        <button 
                            className="action-btn primary" 
                            onClick={handleUpload}
                            disabled={!file || status !== 'idle'}
                        >
                            {status === 'idle' ? 'Upload Video' : 'Please Wait...'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadVideo;