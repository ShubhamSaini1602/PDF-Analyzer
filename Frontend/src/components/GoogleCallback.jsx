import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router"; 
import { useDispatch, useSelector } from "react-redux";
import { googleAuth } from "../CentralStore/authSlice";

function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, error: reduxError } = useSelector((state) => state.auth);
    // Use a ref to prevent double-firing useEffect in React Strict Mode
    const processedRef = useRef(false);
    const [isMinTimePassed, setIsMinTimePassed] = useState(false);
    const [googleError, setgoogleError] = useState(null);

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
        const error = searchParams.get("error");

        if(error){
            setgoogleError("Login Cancelled");
            return;
        }
        
        if (code && !processedRef.current && !isAuthenticated) {
            processedRef.current = true; // Mark as processed
            dispatch(googleAuth(code));
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
        if (reduxError || googleError) {
            const timer = setTimeout(() => navigate("/login"), 3000);
            return () => clearTimeout(timer);
        }
    }, [reduxError, googleError, navigate]);

    const displayError = reduxError || googleError;

    return (
        <div className="google-auth-container">
            {displayError ? (
                <>
                    <h2 style={{color: "#ef4444", fontSize: "2rem"}} className="error-glow">Login Failed</h2>
                    <p style={{marginTop: "10px", color: "#cbd5e1"}}>{displayError}</p>
                    <p style={{marginTop: "20px", color: "#64748b"}}>Redirecting to login...</p>
                </>
            ) : (
                <>
                    {/* Modern Animated Loader */}
                    <div className="tech-loader"></div>
                    
                    <h2 className="loading-title">Authenticating...</h2>
                    <p className="loading-subtitle">Securing your session with Google</p>
                </>
            )}
        </div>
    );
}

export default GoogleCallback;