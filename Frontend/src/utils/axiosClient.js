// axiosClient.js
import axios from "axios";

let baseURL;

// Check if we are running in Development mode (npm run dev)
if (import.meta.env.DEV) {
    // Force Localhost during development
    baseURL = "http://localhost:3000";
    console.log("Development Mode: Connected to Localhost");
} 
else {
    // In Production (Netlify), use the Environment Variable
    baseURL = import.meta.env.VITE_LIVE_BACKEND_URL;
}

const axiosClient = axios.create({
    // URL where your backend/server is hosted
    baseURL: baseURL,
    // This tells the browser to automatically attach any stored cookies with 
    // every request made to the server.
    withCredentials: true,
    // This tells the server that the data you are sending is in JSON format.
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosClient;