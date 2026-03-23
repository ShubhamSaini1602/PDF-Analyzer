import Aurora from "./Aurora";
import { Link } from "react-router";
import ProfileMenu from "./ProfileMenu";
import TrueFocus from "./TrueFocus";
import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import arrowImg from "../assets/arrow.png";
import codeSymbolImg from "../assets/code-symbol.png";
import logoImg from "../assets/Logo.png";
import problemSolvingImg from "../assets/problem-solving.png";

function ProblemsPage(){
    const [allProblems, setAllProblems] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [difficultyValue, setDifficultyValue] = useState("Difficulty");
    const [categoryValue, setCategoryValue] = useState("Category");
    const [companyValue, setCompanyValue] = useState("Company");
    // ----------------------------------------------------------------
    const { user } = useSelector((state) => state.auth);

    async function fetchData(){
        const response = await axiosClient.get("/problem/getAllProblems");
        const data = response.data;
        setAllProblems(data);
    }

    useEffect(() => {
        fetchData();
    }, []);

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
        <Aurora
            colorStops={["#3730a3", "#86198f", "#155e75"]}
            blend={1}
            amplitude={1}
            speed={0.5}
        />

        <div className="navbar">
            <img src={logoImg} className="logo"></img>
            <div className="navbar-2">
                <div className="div1 extra-div-1">
                    <i className="ri-home-7-fill home-icon"></i>
                    <Link to="/">
                        <button className="btn">Home</button>
                    </Link>
                </div>
                <div className="div1">
                    <i className="ri-code-box-fill problem-icon"></i>
                    <Link to="/problems">
                        <button className="btn">Problems</button>
                    </Link>
                </div>
                <div className="div1 extra-div-2">
                    <i className="ri-phone-fill call-icon"></i>
                    <Link to="/contact">
                        <button className="btn">Contact Us</button>
                    </Link>
                </div>
            </div>
            <div className="profile-menu-div">
                {user?.role==="admin" ? (
                    <Link to="/adminPanel">
                        <button className="admin-btn">Admin Panel</button>
                    </Link>
                ) : (
                    <ProfileMenu/>
                )}
            </div>
            <Link to="/premium">
                <button className="premium-features">Premium</button>
            </Link>
        </div>

        <div className="problems-hero-section">
            <div className="hero-section-text">
                <div className="txt-trueFocus">
                    <p className="problem-hub">Welcome to Your</p>
                    <div className="true-focus-containeR">
                        <TrueFocus 
                            sentence="Problem Hub"
                            manualMode={false}
                            blurAmount={3}
                            borderColor="blue"
                            animationDuration={2}
                            pauseBetweenAnimations={1}
                        />
                    </div>
                </div>
                <p className="sharpen">Sharpen your coding skills, track progress, and unlock achievements as you solve challenges crafted to push your limits.</p>
                <p className="last-text">Every problem you solve levels you up. <img src={arrowImg} className="arrow"></img></p>
            </div>
            <img src={problemSolvingImg} className="problem-solving-img"></img>
        </div>

        <hr className="problem-hr-tag"></hr>

        <div className="explore-problems">
            <img src={codeSymbolImg} className="left-symbol"></img>
            <p className="allProblems">Explore Coding Problems</p>
            <img src={codeSymbolImg} className="right-symbol"></img>
        </div>

        {/* Our Problems List */}
        <div className="problems-list-container">
            <div className="all-filters">
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
            <div className="start-practicing">
                <div className="total-problems-count">
                    <i className="ri-flashlight-line lightning"></i>
                    <p className="count">{filteredProblems.length}</p>
                    <p className="TEXT">problems</p>
                </div>
                <p className="practicing"><i className="ri-check-double-line double-tick"></i> Start practicing</p>
            </div>

            <div className="problems-list">
                {
                    filteredProblems.map((problem, index) => {
                        // Check if the current problem ID exists in the user's solved array
                        const isSolved = user?.problemsSolved?.includes(problem._id);

                        return (
                            <>
                            <Link to={`/problem/${problem._id}`} className="remove-line">
                            <div className="problem" key={problem?._id}>
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
                                    {/* Render Badge if Solved */}
                                    {isSolved && (
                                        <div className="solved-badge-corner">
                                            <i className="ri-checkbox-circle-line solved-icon"></i> Solved
                                        </div>
                                    )}
                                </div>
                            </div>
                            </Link>
                            </>
                        )
                    })
                }
            </div>
        </div>
        </>
    )
}

export default ProblemsPage;










