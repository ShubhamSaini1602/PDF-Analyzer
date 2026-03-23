// userAuth.js
const express = require("express");
const authRouter = express.Router();
const validateUser = require("../utils/validateUser");
const User = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateToken = require("../middleware/validateToken");
const redisClient = require("../config/redis");
const validateAdmin = require("../middleware/validateAdmin");
const Submission = require("../Models/submission");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");
const sendContactSupportEmail = require("../utils/sendContactSupportEmail");

const isProduction = process.env.NODE_ENV === "production";

// GOOGLE AUTH CONFIGURATION
const { OAuth2Client } = require('google-auth-library');
const REDIRECT_URI = isProduction
    ? 'https://byte-rank.netlify.app/auth/google-callback'
    : 'http://localhost:5173/auth/google-callback';

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);
// -------------------------


// User Registration Logic
// Phase 1: Send OTP
authRouter.post("/send-otp", async(req,res) => {
    try{
        const { emailId } = req.body;
        
        // Check if a user with this email already exists in MongoDB
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            throw new Error("User already exists with this email.");
        }

        // Generate a secure 6-digit OTP using crypto library
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store this OTP in Redis with a Time-To-Live (TTL) of 300 seconds (5 mins)
        await redisClient.set(`otp:${emailId}`, otp);
        await redisClient.expire(`otp:${emailId}`, 300);

        // Send the OTP to the user’s email using Resend
        const isSent = await sendEmail(emailId, otp);

        if (!isSent) {
            throw new Error("Failed to send email.");
        }

        res.status(200).json({ message: "Verification code sent to your email." });
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
});

// User Registration Logic
// Phase 2: Register the User
authRouter.post("/register", async(req,res) => {
    try{
        const { firstName, lastName, emailId, password, otp } = req.body;
        // ====== VERIFICATION STARTS ======
        // Fetch the OTP stored in Redis for this email
        const storedOtp = await redisClient.get(`otp:${emailId}`);

        // If no OTP exists, it means it expired (5 mins passed)
        if (!storedOtp) {
            throw new Error("OTP has expired. Please request a new one.");
        }

        // Check if the OTP matches what the user entered
        if (storedOtp !== otp) {
            throw new Error("Invalid OTP. Please check your email.");
        }
        // ====== VERIFICATION ENDS ======

        validateUser({firstName, lastName, emailId, password});

        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({
            firstName,
            lastName,
            emailId,
            password: hashedPassword
        });

        // JWT Token Logic
        const payload = {
            _id: user._id,
            emailId: req.body.emailId,
            role: "user"
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '1h'});
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }
        res.status(201).json({
            user: reply,
            message: "User Registered Successfully"
        });
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
});

// User/Admin Login Logic
authRouter.post("/login", async(req,res) => {
    try{
        // Kya pata User emailId ya password daalna bhool gaya ho
        if(!req.body.emailId || !req.body.password){
            throw new Error("Invalid Credentials");
        }

        const user = await User.findOne({emailId: req.body.emailId});
        // Check If user exists
        if(!user){
            throw new Error("Invalid Credentials");
        }
        // --------
        if(!(req.body.emailId===user.emailId)){
            throw new Error("Invalid Credentials");
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match){
            throw new Error("Invalid Credentials");
        }

        // JWT Token Logic
        const payload = {
            _id: user._id,
            emailId: req.body.emailId,
            role: user.role
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '1h'});
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            problemsSolved: user.problemsSolved
        }
        res.status(201).json({
            user: reply,
            message: "Login Successfully"
        });
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
});

// Google Login Logic
authRouter.post("/google-login", async(req,res) => {
    try{
        const { code } = req.body;
        const { tokens } = await googleClient.getToken(code);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const googlePayload = ticket.getPayload();
        const { email, given_name, family_name, sub: googleId, picture } = googlePayload;

        // Check if User Exists in DB
        let user = await User.findOne({ emailId: email });

        if (user) {
            if(!user.googleId){
                user.googleId = googleId;
            }
            user.firstName = given_name;
            user.lastName = family_name;
            user.profilePicture = picture;
            await user.save();
        } 
        else {
            user = await User.create({
                firstName: given_name,
                lastName: family_name,
                emailId: email,
                googleId: googleId,
                role: "user",
                // password is NOT required due to Google Login
                profilePicture: picture
            });
        }

        const payload = {
            _id: user._id,
            emailId: user.emailId,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            problemsSolved: user.problemsSolved,
            profilePicture: user.profilePicture
        };

        res.status(200).json({
            user: reply,
            message: "Google Login Successful"
        });
    }
    catch(err){
        console.log("Google Auth Error:", err);
        res.status(400).send("Google Login Failed");
    }
});

// GitHub Login Logic
authRouter.post("/github-login", async(req,res) => {
    try{
        const { code } = req.body;
        if (!code) {
            throw new Error("No code provided");
        }

        // Exchange the authorization code received from GitHub for access tokens.
        // This request is sent from the backend to GitHub’s access token API.
        // We pass our GitHub application's client_id and client_secret along with the
        // authorization code to prove our identity. GitHub verifies the code and the 
        // client credentials, and if everything is valid, it responds with an access token 
        // (and related OAuth data) in JSON format.
        const tokenResponse = await axios.post("https://github.com/login/oauth/access_token",
            {

                client_id: isProduction ? process.env.GITHUB_CLIENT_ID_PROD : process.env.GITHUB_CLIENT_ID,
                client_secret: isProduction ? process.env.GITHUB_CLIENT_SECRET_PROD : process.env.GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: { Accept: "application/json" } // Ask for JSON response
            }
        );

        // Extract the access token from tokenResponse.
        // This access token represents the authenticated GitHub user and is used
        // to make authorized requests to GitHub’s APIs (for example, to fetch
        // the user’s profile information).
        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            throw new Error("Failed to retrieve access token from GitHub");
        }

        // Fetch the authenticated user's profile information from GitHub.
        // This request is made to GitHub’s User API and must include the access token
        // in the Authorization header to prove that the user has already been authenticated.
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Extract the GitHub user's profile data
        const githubUser = userResponse.data;

        // GitHub allows users to keep their email address private.
        // In such cases, the "email" field returned from the /user API will be null.
        let email = githubUser.email;
        if (!email) {
            // If the email is null, we must make an additional request to GitHub’s
            // /user/emails API to fetch the list of emails associated with the user's account.
            // This API requires authentication using the same access token.
            const emailsResponse = await axios.get("https://api.github.com/user/emails",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            // From the list of emails returned by GitHub, find the email that is
            // marked as both 'primary' and 'verified', since this is the most
            // reliable email to use for account creation.
            const primaryEmailObj = emailsResponse.data.find(
                (emailObj) => emailObj.primary === true && emailObj.verified === true
            );

            // If a valid primary and verified email is found, extract it.
            if (primaryEmailObj) {
                email = primaryEmailObj.email;
            } 
            else {
                // If no verified email is available, we throw an error.
                throw new Error("No verified email found in GitHub account.");
            }
        }

        // Check if User Exists in DB
        let user = await User.findOne({ emailId: email });

        if(user){
            // GitHub only provides a username, which is what we see on the GitHub profile. 
            // There is no concept of firstName and lastName in GitHub. Therefore, we will 
            // assign the username to firstName and set lastName as an empty string.
            user.firstName = githubUser.login;
            user.lastName = "";
            user.githubId = githubUser.id;
            user.profilePicture = githubUser.avatar_url;
            await user.save();
        }
        else{
            // Create New User
            user = await User.create({
                firstName: githubUser.login,
                lastName: "",
                emailId: email,
                githubId: githubUser.id,
                role: "user",
                profilePicture: githubUser.avatar_url
            });
        }

        const payload = {
            _id: user._id,
            emailId: user.emailId,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });

        const reply = {
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            problemsSolved: user.problemsSolved,
            profilePicture: user.profilePicture,
        };

        res.status(200).json({
            user: reply,
            message: "GitHub Login Successful",
        });
    }
    catch(err){
        console.log("GitHub Auth Error:", err.message);
        res.status(400).send("GitHub Login Failed");
    }
});

// Send Contact Support Email Logic
authRouter.post("/contact-us", async(req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            throw new Error("Please fill in all required fields.");
        }

        const isSent = await sendContactSupportEmail(
            { name, email }, 
            subject || "General Inquiry", 
            message
        );

        if (!isSent) {
            throw new Error("Failed to send message. Please try again later.");
        }

        res.status(200).json({ message: "Message sent successfully! We'll get back to you soon." });
    } 
    catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// User Logout Logic
authRouter.post("/logout",validateToken, async(req,res) => {
    try{
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        res.send("Logged Out Successfully");
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
});

// Admin Registration Logic ---> Ignore this route (Consider it hidden)
authRouter.post("/admin/register", validateAdmin, async(req,res) => {
    try{
        validateUser(req.body);

        req.body.password = await bcrypt.hash(req.body.password, 10);
        req.body.role = "admin";
    
        const user = await User.create(req.body);
        // JWT Token Logic
        const payload = {
            _id: user._id,
            emailId: req.body.emailId,
            role: "admin"
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '1h'});
        res.cookie("token", token);
        res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: " + err.message)
    }
});

// User getProfile Logic
authRouter.get("/getProfile", validateToken, async(req,res) => {
    try{
        res.status(200).send(req.result);
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
});

// Delete a User Profile
authRouter.post("/deleteProfile", validateToken, async(req,res) => {
    try{
        const userId = req.result._id;
        // Delete User's Data
        await User.findByIdAndDelete(userId);
        // Also, delete all submissions made by that user
        await Submission.deleteMany({userId});

        res.status(200).send("Profile Deleted Successfully");
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

// Checking Authenticity of the user when the app first loads
authRouter.get("/checkAuth", validateToken, (req,res) => {
    try{
        const reply = {
            firstName: req.result.firstName,
            lastName: req.result.lastName,
            emailId: req.result.emailId,
            _id: req.result._id,
            role: req.result.role,
            problemsSolved: req.result.problemsSolved,
            profilePicture: req.result.profilePicture
        }

        res.status(201).json({
            user: reply,
            message: "Valid User"
        })
    }
    catch(err){
        res.status(401).send("Error: " + err.message);
    }
});

// Get all the users
authRouter.get("/getAllUsers", validateToken, async(req,res) => {
    try{
        const allUsers = await User.find({});
        if(allUsers.length===0){
            throw new Error("No users exist at the moment");
        }

        res.status(201).send(allUsers);
    }
    catch(err){
        res.status(404).send("Error: " + err.message);
    }
})

module.exports = authRouter;
