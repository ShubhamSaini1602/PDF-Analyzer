import { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useEffect } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

function PanelProblems(){
    const [allProblems, setAllProblems] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [difficultyValue, setDifficultyValue] = useState("Difficulty");
    const [categoryValue, setCategoryValue] = useState("Category");
    const [companyValue, setCompanyValue] = useState("Company");
    // --------------------------------------------------------------
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

    async function handleDelete(problem){
        // Ask for confirmation
        if (!window.confirm(`Are you sure you want to delete "${problem?.title}"?`)) {
            return; // Stop if the user clicks "Cancel"
        }
        await axiosClient.delete(`/problem/delete/${problem?._id}`);
        // Update the state: remove the deleted problem from the *main list*
        const newProblemsList = allProblems.filter((problemObj) => problemObj._id != problem._id);
        setAllProblems(newProblemsList); 
        
        alert("Problem deleted successfully!");
    }

    return (
        <>
        <h1 className="list-of-problems">Problems List</h1>
        <p className="problemsList-description">Manage and organize all coding problems on your platform.</p>

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
                    filteredProblems.map((problem, index) => {
                        // Check if the current problem ID exists in the user's solved array
                        const isSolved = user?.problemsSolved?.includes(problem._id);

                        return (
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
                                    <div className="update-delete">
                                        <Link to={`/adminPanel/updateProblem/${problem?._id}`}>
                                            <button className="update-problem" title="Update Problem"><i className="ri-edit-line update-icon"></i></button>
                                        </Link>
                                        <button className="delete-problem" title="Delete Problem" onClick={() => handleDelete(problem)}><i className="ri-delete-bin-line delete-icon"></i></button>
                                    </div>
                                    {/* Render Badge if Solved */}
                                    {isSolved && (
                                        <div className="solved-badge-corner-3">Solved</div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
        </>
    )
}

export default PanelProblems;