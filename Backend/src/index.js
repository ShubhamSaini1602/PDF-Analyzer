const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemInfo");
const submitRouter = require("./routes/submitInfo");
const rateLimiter = require("./middleware/rateLimiter");
const cors = require("cors");
const aiRouter = require("./routes/aiChatting");
const notesRouter = require("./routes/notesInfo");
const videoRouter = require("./routes/videoSection");
const paymentRouter = require("./routes/paymentRoutes");

// We must apply the cors middleware before any middleware runs
app.use(cors({
    origin: ["http://localhost:5173", "https://byte-rank.netlify.app"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
    try {
        // Only connect to Redis if it is NOT already connected
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await main();
        console.log("DBs Connected");

        next(); // Move to the actual route (e.g., /user/login)
    } catch (err) {
        console.log("Database Connection Error:", err);
        res.status(500).json({ error: "Database Connection Failed" });
    }
});

// Before Processing any incoming user request (GET, POST, PUT, etc..)
// we'll execute our rateLimiter Logic first
app.use(rateLimiter);

// ------ ROUTES ------
// Jab humara path /user hoga, toh authRouter par chale jaana
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/note", notesRouter);
app.use("/video", videoRouter);
app.use("/payment", paymentRouter);

// A simple route to test if the backend is live in the browser
app.get("/", (req, res) => {
    res.send("ByteRank Backend is Running");
});

module.exports = app;

if(require.main === module){
    const InitializeConnection = async() => {
        try{
            await Promise.all([redisClient.connect(), main()]);
            console.log("DBs Connected");

            app.listen(process.env.PORT, () => {
                console.log("Listening at port number " + process.env.PORT);
            });
        }
        catch(err){
            console.log("Error: " + err.message);
        }
    }

    InitializeConnection();
}

