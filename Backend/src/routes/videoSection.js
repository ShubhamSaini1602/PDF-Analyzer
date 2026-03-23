// videoSection.js
const express = require("express");
const videoRouter = express.Router();
const SolutionVideo = require("../Models/solutionVideo");
const Problem = require("../Models/problem");
const validateAdmin = require("../middleware/validateAdmin");
const validateToken = require("../middleware/validateToken");
const cloudinary = require('cloudinary').v2;
const validatePremium = require("../middleware/validatePremium");


// ====== CLOUDINARY CONFIGURATION ======
// This connects our backend to our Cloudinary account using the keys from our .env file.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // Treat it as a public key
  api_secret: process.env.CLOUDINARY_API_SECRET // Treat it as a private key
});

// ====== GENERATE DIGITAL SIGNATURE ======
// Now, if the admin wants to upload a video to Cloudinary from the frontend, the first step is to 
// request a digital signature from the backend. The backend first verifies whether the user is actually an admin. 
// If the user is verified, the backend generates a secure digital signature and sends it back to the frontend. 
// Only then can the upload happen. This ensures that no unauthorized user can directly upload videos to Cloudinary.
videoRouter.get("/createSignature/:problemId", validateAdmin, async(req,res) => {
    try{
        const { problemId } = req.params;
        const userId = req.result._id;

        // Ensure the problem actually exists.
        // We don't want users uploading videos for non-existent problems.
        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new Error("Problem Not Found");
        }

        // Check if a video solution already exists for this problem
        const existingVideo = await SolutionVideo.findOne({ problemId, userId });
        if (existingVideo) {
            return res.status(400).json({ 
                error: { 
                    message: "A video solution already exists. Please delete it first." 
                } 
            });
        }

        // Generate a publicId
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

        // Adaptive Bitrate Streaming (ABR)
        // eagerTransformation tells Cloudinary: "Don't just save the video file. Also, create a special playlist 
        // file (.m3u8) that contains the video in 1080p, 720p, and 480p.
        // Why? So when the user has slow internet, the video player can automatically switch to 480p without buffering.
        const eagerTransformation = "sp_full_hd/m3u8";

        // Build params for signature
        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId,
            eager: eagerTransformation, 
            // When we upload a video to Cloudinary, Cloudinary will create different versions of that video like 1080p, 720p, 480p, etc.
            // This processing takes some time because Cloudinary has to convert the video into those resolutions. Now, if we don’t use 
            // eager_async: true, then Cloudinary will do all this processing immediately during the upload, and the admin will have to keep 
            // waiting until everything finishes. That means the upload process will get very slow and very long. But when we set eager_async: true, 
            // Cloudinary processes these different versions in the background (asynchronously) without blocking the upload process.
            // This makes the experience faster and smoother for the admin.
            eager_async: true, 
            format: "mp4"
        };

        // Generate a secure digital signature by signing the upload parameters with our Cloudinary private key.
        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            public_id: publicId,
            eager: eagerTransformation,
            eager_async: true,
            format: "mp4",
            // Why are we sending the api_key (public key) to the frontend?
            // We send the api_key (public key) to the frontend so that when Cloudinary receives the upload request, it can first identify which Cloudinary 
            // account the upload belongs to. Since millions of users use Cloudinary, it needs your api_key to know, “Upload this video into THIS user’s account.”
            // After identifying the account, Cloudinary also takes the same upload parameters we sent and generates its own digital signature using the private 
            // key it has stored. It then compares its generated signature with the signature we sent from our backend. If both signatures match, Cloudinary confirms 
            // that the request is genuine and secure, and then it allows the upload to proceed.
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            // upload_url is the Cloudinary server address. After the video reaches Cloudinary through this URL, then Cloudinary uses publicId to decide:
            // Where to put it and What to name it...
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
        });
    }
    catch(error){
        console.log('Error generating signature:', error);
        res.status(500).send("Failed to generate Digital Signature");
    }
});

// ====== SAVE VIDEO METADATA ======
// After the frontend successfully uploads the video to Cloudinary, Cloudinary sends back all the video details 
// (called video metadata) such as its URL, publicId, duration, size, and format etc to the frontend. However, this upload 
// has only happened on Cloudinary — our MongoDB database still has no information about it. But MongoDB is our main 
// application database where we store all important records. So, to keep everything in sync, we also need to save this 
// returned metadata into MongoDB. Once saved, our application officially knows that a new video exists, and we can later 
// fetch it, display it, update it, or delete it whenever required.
videoRouter.post("/save", validateAdmin, async(req,res) => {
    try{
        const { problemId, title, description, cloudinaryPublicId, duration, format, size } = req.body;
        const userId = req.result._id;

        // Double check: Is this video REALLY uploaded to Cloudinary?
        // If the video actually exists on Cloudinary, it will return the complete metadata containing all the details about that video.
        const cloudinaryResource = await cloudinary.api.resource(cloudinaryPublicId, {resource_type: 'video'});

        if (!cloudinaryResource) {
            throw new Error("Video Verification Failed. Upload not Found.");
        }

        // Prevent duplicate submissions
        const existingVideo = await SolutionVideo.findOne({ problemId, userId });
        if (existingVideo) {
            throw new Error("Video Solution already exists for this problem");
        }

        // ------ Generate Video URLs ------

        // A. The Standard Link (Fallback if playbackUrl fails)
        const secureUrl = cloudinaryResource.secure_url;
    
        // B. The Adaptive Streaming Link (The Pro Feature)
        const playbackUrl = cloudinary.url(cloudinaryPublicId, { 
            resource_type: "video", 
            format: "m3u8",
            // streaming_profile: "full_hd"' matches the eager transformation we used earlier
            streaming_profile: "full_hd"
        });

        // C. Smart Thumbnail
        // We don't upload a separate image. We ask Cloudinary to generate one from the video.
        // We grab a frame from the video, resize it to 1280px width (HD), and save it as JPG.
        const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
            resource_type: 'video',
            format: 'jpg',
            transformation: [{ width: 1280, crop: "scale" }, { quality: "auto" }]
        });

        // Save everything to MongoDB
        const newVideo = await SolutionVideo.create({
            userId,
            problemId,
            title: title || "Solution Video",
            description: description || "",
            cloudinaryPublicId,
            secureUrl,
            playbackUrl, 
            thumbnailUrl,
            duration: cloudinaryResource.duration || duration,
            format: cloudinaryResource.format || format,
            size: cloudinaryResource.bytes || size,
            status: 'active'
        });

        res.status(201).json({ 
            message: 'Video Metadata Saved successfully', 
            video: newVideo 
        });
    }
    catch(error){
        console.log('Error saving metadata:', error);
        res.status(500).send("Failed to save video solution");
    }
});

// ====== DELETE VIDEO ======
videoRouter.delete("/delete/:problemId", validateAdmin, async(req,res) => {
    try{
        const { problemId } = req.params;
        const userId = req.result._id; 

        const video = await SolutionVideo.findOne({ problemId, userId });

        if(!video){
            throw new Error("Video not found");
        }

        // Delete the video from Cloudinary
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { 
            resource_type: 'video', 
            // Cloudinary uses CDNs (fast servers around the world) to cache videos. If you delete a video, it might still 
            // exist on a server in London for a few hours. So, invalidate: true forces all servers to delete it immediately.
            invalidate: true 
        });

        // Once the file is deleted from Cloudinary, we remove its record from MongoDB as well
        await SolutionVideo.findByIdAndDelete(video._id);

        res.json({ message: 'Video deleted successfully' });
    }
    catch(error){
        console.log('Error deleting video:', error);
        res.status(500).send("Failed to delete video");
    }
});

// ====== FETCH VIDEO ======
// Locked Route: Only Premium Users can get the video solution
videoRouter.get("/getVideo/:problemId", validateToken, validatePremium, async(req,res) => {
    try{
        const { problemId } = req.params;

        // Find the Video Solution linked to this problem
        const video = await SolutionVideo.findOne({ problemId: problemId })
                    .select("title description playbackUrl thumbnailUrl duration views");
        
        if (!video) {
            throw new Error("No video solution available for this problem");
        }

        // Increment View Count -> This is how YouTube counts views. Every time this API is hit, we add +1 to the views counter.
        // Pro Tip: I removed the await keyword for this specific line. We don't await this because we don't want the user to wait 
        // for the counter update just to watch the video. This way the user gets their video immediately, and the database updates 
        // the view count a few milliseconds later in the background.
        //                                          { $inc: { views: 1 } }
        // a) $inc: The $inc operator stands for "Increment". It is a MongoDB specific command used to increase or decrease the value of a numerical field.
        // b) views: The specific field name in your database you want to change.
        // c) 1: The amount to add.
        SolutionVideo.findByIdAndUpdate(video._id, { $inc: { views: 1 } }).exec();

        // Send the Video Data to Frontend
        res.json({
            videoUrl: video.playbackUrl,
            thumbnail: video.thumbnailUrl,
            title: video.title,
            desc: video.description,
            duration: video.duration,
            views: video.views
        });
    }
    catch(error){
        console.log("Error fetching video:", error);
        res.status(500).send("Failed to fetch video solution");
    }
});

module.exports = videoRouter;





