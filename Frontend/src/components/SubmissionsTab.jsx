import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

function SubmissionsTab({ problemId }){
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Submissions 
    useEffect(() => {
        async function fetchSubmissions(){
            try {
                setIsLoading(true);
                const response = await axiosClient.get(`/problem/getSubmissions/${problemId}`);
                // Sort by newest submission first
                const sortedData = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setSubmissions(sortedData);
            } 
            catch (err) {
                if (err.response && err.response.status !== 404) {
                    console.log("Error fetching submissions:", err);
                } 
                else {
                    setSubmissions([]); 
                }
            } 
            finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [problemId]);

    function getStatusDetails(status){
        switch (status) {
            case "Accepted":
                return { icon: "ri-checkbox-circle-line", colorClass: "text-green", glow: "glow-green" };
            case "Wrong Answer":
                return { icon: "ri-close-circle-line", colorClass: "text-red", glow: "glow-red" };
            case "Time Limit Exceeded":
                return { icon: "ri-timer-flash-line", colorClass: "text-yellow", glow: "glow-yellow" };
            case "Compilation Error":
                return { icon: "ri-code-box-line", colorClass: "text-orange", glow: "glow-orange" };
            case "Runtime Error":
                return { icon: "ri-error-warning-line", colorClass: "text-red", glow: "glow-red" };
            default:
                return { icon: "ri-loader-4-line", colorClass: "text-gray", glow: "" };
        }
    };

    function formatLang(lang){
        const langMap = {
            "c++": "C++",
            "cpp": "C++",
            "javascript": "JavaScript",
            "js": "JavaScript",
            "java": "Java",
        };
        return langMap[lang.toLowerCase()];
    };

    // Show Shimmer Effect
    if (isLoading) {
        return (
            <div className="submissions-wrapper">
                <div className="submissions-scroll">
                    <div className="submissions-table">
                        <div className="sub-header">
                            <div className="sub-col-status">STATUS</div>
                            <div className="sub-col-lang">LANGUAGE</div>
                            <div className="sub-col-runtime">RUNTIME</div>
                            <div className="sub-col-memory">MEMORY</div>
                            <div className="sub-col-cases">TEST CASES</div>
                            <div className="sub-col-date">DATE</div>
                        </div>
                        <div className="shimmer-container">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className="shimmer-row"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If no submission has been made yet, show this div
    if (submissions.length === 0) {
        return (
            <div className="submissions-wrapper empty-state">
                <div className="empty-content">
                    <div className="empty-icon-box">
                        <i className="ri-inbox-archive-line"></i>
                    </div>
                    <h3>No Submissions Yet</h3>
                    <p>Solve the problem and submit your code to see it here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="submissions-wrapper">
            <div className="submissions-scroll">
                <div className="submissions-table">
                    
                    {/* Header */}
                    <div className="sub-header">
                        <div className="sub-col-status">STATUS</div>
                        <div className="sub-col-lang">LANGUAGE</div>
                        <div className="sub-col-runtime">RUNTIME</div>
                        <div className="sub-col-memory">MEMORY</div>
                        <div className="sub-col-cases">TEST CASES</div>
                        <div className="sub-col-date">DATE</div>
                    </div>

                    {/* Body */}
                    <div className="sub-body">
                        {submissions.map((sub, index) => {
                            const { icon, colorClass, glow } = getStatusDetails(sub.status);
                            const isAccepted = sub.status === "Accepted";

                            return (
                                <div 
                                    key={sub._id || index} 
                                    className={`sub-row ${isAccepted ? 'row-accepted' : ''}`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    
                                    {/* Status */}
                                    <div className={`sub-col-status ${colorClass}`}>
                                        <div className={`icon-box ${glow}`}>
                                            <i className={icon}></i>
                                        </div>
                                        <span className="status-text">{sub.status}</span>
                                    </div>

                                    {/* Language */}
                                    <div className="sub-col-lang">
                                        <span className="lang-badge">
                                            <i className="ri-code-s-slash-line"></i>
                                            {formatLang(sub.language)}
                                        </span>
                                    </div>

                                    {/* Runtime */}
                                    <div className="sub-col-runtime">
                                        <div className="metric-value">
                                            <i className="ri-time-line"></i>
                                            <span>{isAccepted ? `${sub.runtime} ms` : "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* Memory */}
                                    <div className="sub-col-memory">
                                        <div className="metric-value">
                                            <i className="ri-hard-drive-2-line"></i>
                                            <span>{isAccepted ? `${(sub.memory / 1024).toFixed(2)} KB` : "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* Test Cases */}
                                    <div className="sub-col-cases">
                                        <div className={`cases-pill ${isAccepted ? 'pass' : 'fail'}`}>
                                            {isAccepted ? <i className="ri-check-double-line"></i> : <i className="ri-alert-line"></i>}
                                            {sub.testCasesPassed} / {sub.testCasesTotal}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="sub-col-date">
                                        <span className="date-text">{new Date(sub.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionsTab;