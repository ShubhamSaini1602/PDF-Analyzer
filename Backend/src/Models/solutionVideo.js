const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problems", // Reference to problems collection
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users", // Reference to users collection
        required: true
    },
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    // When we upload a video to Cloudinary, it creates a folder (if it doesn't exist) 
    // and stores the video inside it. We specify which folder to upload to and what the 
    // video’s file name should be. The combination of the folder name and the file name 
    // (folderName/videoFileName) is what Cloudinary calls the public_id. In short, public_id 
    // means --> Inside my account, save this video in this folder, with this exact name.
    cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['uploading', 'processing', 'active', 'failed'],
        default: 'uploading'
    },
    secureUrl: {
        type: String, 
        required: true
    },
    playbackUrl: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number, 
        required: true
    },
    format: {
        type: String
    },
    size: {
        type: Number
    },
    views: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const SolutionVideo = mongoose.model("solutionVideos", videoSchema);

module.exports = SolutionVideo;