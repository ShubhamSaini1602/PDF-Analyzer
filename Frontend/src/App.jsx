import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, Navigate, useLocation } from "react-router";
import Home from "./components/Home";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "./CentralStore/authSlice";
import { useEffect } from "react";
import ProblemsPage from "./components/problemsPage";
import AdminPanel from "./components/AdminPanel";
import Dashboard from "./components/Dashboard";
import PanelProblems from "./components/PanelProblems";
import CreateProblem from "./components/CreateProblem";
import Users from "./components/Users";
import UpdateProblem from "./components/UpdateProblem";
import Problem from "./components/Problem";
import VideoManagement from "./components/VideoManagement";
import UploadVideo from "./components/UploadVideo";
import GoogleCallback from "./components/GoogleCallback";
import GitHubCallback from "./components/GitHubCallback";
import PremiumPage from "./components/PremiumPage";
import ContactUs from "./components/ContactUs";
import { Toaster } from 'react-hot-toast';
import PaymentSuccess from "./components/PaymentSuccess";
import StartJourney from "./components/StartJourney";

function App(){
    const {isAuthenticated, loading} = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // Get the current URL/path 
    const location = useLocation();
    const isGoogleORGitHubCallback = location.pathname.includes("/auth/google-callback") ||
                                     location.pathname.includes("/auth/github-callback");

    useEffect(() => {
        if (!isGoogleORGitHubCallback) {
            dispatch(checkAuth());
        }
    }, [isGoogleORGitHubCallback]);

    if(loading && !isGoogleORGitHubCallback){
        return (
            <>
            <div className="spinner-preview-container">
                <div className="spinner"></div>
            </div>
            </>
        )
    }
    
    return (
        <>
        <div>
            {/* GLOBAL TOASTER CONFIGURATION */}
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
            {/* ROUTES */}
            <Routes>
                <Route path="/" element={isAuthenticated ? <Home/> : <Navigate to="/SignUp"/>}></Route>
                <Route path="/SignUp" element={isAuthenticated ? <Navigate to="/" /> : <SignUp/>}></Route>
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login/>}></Route>
                <Route path="/problems" element={isAuthenticated ? <ProblemsPage/> : <Navigate to="/SignUp" />}></Route>
                <Route path="/adminPanel" element={isAuthenticated ? <AdminPanel/> : <Navigate to="/SignUp" />}>
                    {/* Nested Routes */}
                    {/* index means dashboard is shown by default when we are routed to /adminPanel */}
                    <Route index element={<Dashboard/>}></Route>
                    <Route path="problemsList" element={<PanelProblems/>}></Route>
                    <Route path="createProblem" element={<CreateProblem/>}></Route>
                    <Route path="users" element={<Users/>}></Route>
                    <Route path="updateProblem/:problem_id" element={<UpdateProblem/>}></Route>
                    <Route path="videoManagement" element={<VideoManagement/>}></Route>
                    <Route path="uploadVideo/:problemId" element={<UploadVideo/>}></Route>
                </Route>
                <Route path="/problem/:problem_id" element={isAuthenticated ? <Problem/> : <SignUp/>}></Route>
                <Route path="/auth/google-callback" element={<GoogleCallback/>}></Route>
                <Route path="/auth/github-callback" element={<GitHubCallback />}></Route>
                <Route path="/premium" element={<PremiumPage/>}></Route>
                <Route path="/contact" element={<ContactUs/>}></Route>
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/start-journey" element={<StartJourney />} />
            </Routes>
        </div>
        </>
    )
}

export default App;
