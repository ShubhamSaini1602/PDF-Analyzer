const mongoose = require("mongoose");

let isConnected = false;

async function main() {

    if(isConnected){
        console.log("Using existing MongoDB connection");
        return;
    }

    // Edge case: If Vercel resets the `isConnected` JavaScript variable for any
    // reason, the above `if` condition would fail to detect an existing connection.
    // To handle this, we add an additional check to confirm that the connection
    // is still active (if it actually is).
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        console.log("MongoDB already connected (State check)");
        return;
    }

    try{
        const db = await mongoose.connect(process.env.DB_CONNECTION_STRING);

        // Set the flag to true so we don't connect again next time
        isConnected = db.connections[0].readyState;
    }
    catch(error){
        console.log("Error connecting to MongoDB:", error);
        throw error; // Throw error so index.js knows to send a 500 response
    }
}

module.exports = main;
