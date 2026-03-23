import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router"; 
import { useDispatch, useSelector } from "react-redux";
import { githubAuth } from "../CentralStore/authSlice";

function GitHubCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, error } = useSelector((state) => state.auth);
    // Use a ref to prevent double-firing useEffect in React Strict Mode
    const processedRef = useRef(false);
    const [isMinTimePassed, setIsMinTimePassed] = useState(false);

    // Create a fake timer to improve the user experience
    // so the loading screen stays visible a little longer
    useEffect(() => {
        const timer = setTimeout(() => {
            // Sets 'isMinTimePassed' to true after 4 seconds (4000ms)
            setIsMinTimePassed(true);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const code = searchParams.get("code");
        
        if (code && !processedRef.current && !isAuthenticated) {
            processedRef.current = true; // Mark as processed
            dispatch(githubAuth(code));
        }
    }, [searchParams, dispatch, isAuthenticated]);

    // Wait for BOTH (Auth Success + Timer Finished) and then redirect to Home Page
    useEffect(() => {
        if (isAuthenticated && isMinTimePassed) {
            navigate("/");
        }
    }, [isAuthenticated, navigate, isMinTimePassed]);

    // If there is a critical error, redirect to login after a delay
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => navigate("/login"), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, navigate]);

    return (
        <div className="google-auth-container">
            {error ? (
                <>
                    <h2 style={{color: "#ef4444", fontSize: "2rem"}} className="error-glow">Login Failed</h2>
                    <p style={{marginTop: "10px", color: "#cbd5e1"}}>{error}</p>
                    <p style={{marginTop: "20px", color: "#64748b"}}>Redirecting to login...</p>
                </>
            ) : (
                <>
                    {/* Modern Animated Loader */}
                    <div className="tech-loader"></div>
                    
                    <h2 className="loading-title">Connecting to GitHub...</h2>
                    <p className="loading-subtitle">Syncing your developer profile</p>
                </>
            )}
        </div>
    );
}

export default GitHubCallback;