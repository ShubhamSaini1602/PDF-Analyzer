import { useState } from "react";
import { useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { Link } from "react-router";
import { toast, Toaster } from "react-hot-toast";

function VideoManagement(){
    const [allProblems, setAllProblems] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [difficultyValue, setDifficultyValue] = useState("Difficulty");
    const [categoryValue, setCategoryValue] = useState("Category");
    const [companyValue, setCompanyValue] = useState("Company");

    async function fetchData(){
        const response = await axiosClient.get("/problem/getAllProblems");
        const data = response.data;
        setAllProblems(data);
    }

    useEffect(() => {
        fetchData();
    }, []);

    // --- DELETE VIDEO FUNCTIONALITY ---
    const handleDeleteVideo = async (problemId, problemTitle) => {
        // Safety Check (Confirm Dialog)
        const isConfirmed = window.confirm(
            `Are you sure you want to delete the solution video for "${problemTitle}"?\n\nThis will permanently remove it from Cloudinary and the Database.`
        );

        if (!isConfirmed) return;

        // Processing Toast
        const toastId = toast.loading("Deleting video...");

        try {
            // Call Backend API
            await axiosClient.delete(`/video/delete/${problemId}`);
            // Success Feedback
            // { id: toastId } : It replaces the Loading toast instantly with the Success toast, 
            // rather than showing two separate notifications/toasts.
            toast.success("Video deleted successfully", { id: toastId });
        } 
        catch (error) {
            console.log(error);
            const errorMessage = error.response?.data || "Failed to delete video. It might not exist.";
            toast.error(errorMessage, { id: toastId });
        }
    };

    const filteredProblems = allProblems.filter((problem) => {
        const matchesSearch = searchValue==="" || problem.title.toLowerCase().includes(searchValue.toLowerCase());
        const matchesDifficulty = difficultyValue==="Difficulty" || problem.difficulty===difficultyValue;
        const matchesCategory = categoryValue==="Category" || problem.tags.includes(categoryValue);
        const matchesCompany = companyValue==="Company" || problem.companyTags.includes(companyValue);

        // The problem is kept ONLY if all four conditions are true
        return matchesSearch && matchesDifficulty && matchesCategory && matchesCompany;
    });

    return (
        <>
        {/* Toaster Configuration */}
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

        <div className="video-management-div">
            <img src="/video-management-icon.png" className="video-management-icon"></img>
            <h1 className="video-management-text">Video Management</h1>
        </div>
        <p className="video-management-extra-text">View and manage all Video Solutions on your platform</p>

        {/* Our Problems List */}
        <div className="problems-list-container">
            <div className="all-filters2">
                <div className="icon-input">
                    <i className="ri-search-line search-icon"></i>
                    <input type="text" className="problem-input" name="searchProblems" placeholder="Search problems..." value={searchValue} onChange={(event) => setSearchValue(event.target.value)}></input>
                </div>
                <div className="icon-dropdown">
                    <i className="ri-filter-line dropdown-icon"></i>
                    <select className="dropdown1" name="difficulty" value={difficultyValue} onChange={(event) => setDifficultyValue(event.target.value)}>
                        <option value="Difficulty">Difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <select className="dropdown2" name="category" value={categoryValue} onChange={(event) => setCategoryValue(event.target.value)}>
                    <option value="Category">Category</option>
                    <option value="Math">Math</option>
                    <option value="Array">Array</option>
                    <option value="String">String</option>
                    <option value="Recursion">Recursion</option>
                    <option value="LinkedList">LinkedList</option>
                    <option value="Stack">Stack</option>
                    <option value="Tree">Tree</option>
                    <option value="Graph">Graph</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Two Pointers">Two Pointers</option>
                    <option value="Hash Table">Hash Table</option>
                    <option value="Binary Search">Binary Search</option>
                    <option value="Backtracking">Backtracking</option>
                </select>
                <div className="company-icon-dropdown">
                    <i className="ri-hotel-line company-icon"></i>
                    <select className="dropdown3" name="company" value={companyValue} onChange={(event) => setCompanyValue(event.target.value)}>
                        <option value="Company">Company</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Apple">Apple</option>
                        <option value="Google">Google</option>
                        <option value="Meta">Meta</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="Salesforce">Salesforce</option>
                        <option value="Uber">Uber</option>
                        <option value="Adobe">Adobe</option>
                        <option value="Netflix">Netflix</option>
                        <option value="NVIDIA">NVIDIA</option>
                        <option value="Intel">Intel</option>
                        <option value="IBM">IBM</option>
                        <option value="Oracle">Oracle</option>
                        <option value="Tesla">Tesla</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Cisco">Cisco</option>
                        <option value="Shopify">Shopify</option>
                        <option value="Spotify">Spotify</option>
                    </select>
                </div>
            </div>
            <div className="start-practicing2">
                <div className="total-problems-count">
                    <i className="ri-flashlight-line lightning"></i>
                    <p className="count">{filteredProblems.length}</p>
                    <p className="TEXT">problems</p>
                </div>
                <p className="practicing"><i className="ri-check-double-line double-tick"></i> Start practicing</p>
            </div>

            <div className="problems-list">
                {
                    filteredProblems.map((problem, index) => (
                        <div className="problem2" key={problem?._id}>
                            <div className="numbering">
                                <p className="integer">{index + 1}</p>
                            </div>
                            <div className="main-problem">
                                <p className="problem-title">{problem?.title}</p>
                                <div className="tags_company-tags">
                                    {/* Nested Array Mapping */}
                                    {
                                        problem.tags.map((tag) => (
                                            <div className="tag-div" key={tag}>
                                                <p className="tag-name">{tag}</p>
                                            </div>
                                        ))
                                    }
                                    {
                                        problem.companyTags.map((companyTag) => (
                                            <div className="company-tag-div" key={companyTag}>
                                                <i className="ri-hotel-line company-icon2"></i>
                                                <p className="company-tag-name">{companyTag}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                                <p className="view-problem">View Problem <i className="ri-arrow-right-line right-arrow"></i></p>
                                {/* Conditionally applying CSS classes */}
                                <div className={`difficulty-div ${problem.difficulty==="Easy" ? "green-div" : 
                                            problem.difficulty==="Medium" ? "yellow-div" : "red-div"}`}>
                                    <p
                                        className={`difficulty ${problem.difficulty==="Easy" ? "green-txt" : 
                                            problem.difficulty==="Medium" ? "yellow-txt" : "red-txt"}`}

                                    >{problem?.difficulty}</p>
                                </div>
                                <div className="upload-delete">
                                    <Link to={`/adminPanel/uploadVideo/${problem?._id}`}>
                                        <button className="upload-video" title="Upload Video"><img src="/video-upload-icon.png" className="video-upload-icon"></img></button>
                                    </Link>
                                    <button 
                                        className="delete-video" 
                                        title="Delete Video"
                                        onClick={() => handleDeleteVideo(problem?._id, problem?.title)}
                                    >
                                        <img src="/video-delete-icon.png" className="video-delete-icon"></img>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
        </>
    )
}

export default VideoManagement;