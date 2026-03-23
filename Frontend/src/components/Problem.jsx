import { useParams, Link, useNavigate  } from "react-router";
import axiosClient from "../utils/axiosClient";
import { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSelector, useDispatch } from "react-redux";
import ProfileMenuForEditor from "./ProfileMenuForEditor";
import SubmissionResult from "./SubmissionResult";
import ShareProblem from "./ShareProblem";
import ChatWithAI from "./ChatWithAI";
import NotesPanel from "./NotesPanel";
import Editorial from "./Editorial";
import SubmissionsTab from "./SubmissionsTab";
import { markProblemAsSolved } from "../CentralStore/authSlice";


// Language details for Monaco and Judge0
// We created this array because Monaco and our server use different language names.
// Monaco represents C++ as "cpp", while in our server’s submission schema we store it as "c++".
// So we need this array to correctly handle both environments.
const LANGUAGE_DETAILS = [
    {
        name: "c++",
        id: 54, // Judge0 ID
        monaco: "cpp",
        displayName: "C++",
    },
    {
        name: "javascript",
        id: 63, // Judge0 ID
        monaco: "javascript",
        displayName: "JavaScript",
    },
    {
        name: "java",
        id: 62, // Judge0 ID
        monaco: "java",
        displayName: "Java",
    },
];

// Shimmer Effect
const ResultShimmer = () => (
    <div className="shimmer-wrapper">
        <div className="shimmer-line title"></div>
        <div className="shimmer-line subtitle"></div>
        <div className="shimmer-card"></div>
        <div className="shimmer-line subtitle"></div>
        <div className="shimmer-card"></div>
    </div>
);

// Custom Dropdown for Settings
const CustomSelect = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Find the label for the currently selected value
    const selectedLabel = options.find(opt => opt.value === value)?.label;

    // Handle closing when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOptionClick = (newValue) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="custom-select-container" ref={selectRef}>
            <button 
                className="custom-select-value" 
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span>{selectedLabel}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? 'open' : ''}`}></i>
            </button>
            
            {isOpen && (
                <div className="custom-select-options">
                    {options.map(option => (
                        <button
                            key={option.value}
                            className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            {option.label}
                            {option.value === value && <i className="ri-check-line"></i>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom Dropdown for Languages
const LanguageDropdown = ({ selectedLanguage, languages, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="lang-dropdown-container" ref={dropdownRef}>
            <button 
                className={`lang-dropdown-btn ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="lang-name">{selectedLanguage.displayName}</span>
                <i className={`ri-arrow-down-s-line ${isOpen ? 'rotate' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="lang-dropdown-menu">
                    {languages.map((lang) => (
                        <button
                            key={lang.id}
                            className={`lang-option ${selectedLanguage.name === lang.name ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(lang.name);
                                setIsOpen(false);
                            }}
                        >
                            {lang.displayName}
                            {selectedLanguage.name === lang.name && <i className="ri-check-line"></i>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const fontSizeOptions = [
    { value: 12, label: "12 px" },
    { value: 13, label: "13 px" },
    { value: 14, label: "14 px" },
    { value: 15, label: "15 px" },
    { value: 16, label: "16 px" },
    { value: 18, label: "18 px" },
    { value: 20, label: "20 px" },
];

const tabSizeOptions = [
    { value: 2, label: "2 spaces" },
    { value: 4, label: "4 spaces" },
];

const SettingsDropdown = ({ menuRef, settings, onChange }) => (
    <div className="settings-dropdown" ref={menuRef}>
        <div className="setting-item">
            <label htmlFor="font-size">
                <i className="ri-font-size"></i>
                Font Size
            </label>
            <CustomSelect
                options={fontSizeOptions}
                value={settings.fontSize}
                onChange={(value) => onChange('fontSize', value)}
            />
        </div>

        <div className="setting-item">
            <label htmlFor="tab-size">
                <i className="ri-indent-increase"></i>
                Tab Size
            </label>
            <CustomSelect
                options={tabSizeOptions}
                value={settings.tabSize}
                onChange={(value) => onChange('tabSize', value)}
            />
        </div>

        <hr className="settings-divider" />

        <div className="setting-item">
            <label htmlFor="word-wrap">
                <i className="ri-text-wrap"></i>
                Word Wrap
            </label>
            <label className="toggle-switch">
                <input 
                    type="checkbox" 
                    id="word-wrap"
                    checked={settings.wordWrap === 'on'}
                    onChange={(e) => onChange('wordWrap', e.target.checked ? 'on' : 'off')}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>

        <div className="setting-item">
            <label htmlFor="line-numbers">
                <i className="ri-hashtag"></i>
                Line Numbers
            </label>
            <label className="toggle-switch">
                <input 
                    type="checkbox" 
                    id="line-numbers"
                    checked={settings.lineNumbers === 'on'}
                    onChange={(e) => onChange('lineNumbers', e.target.checked ? 'on' : 'off')}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>

        {/* --- NEW EASY FEATURE --- */}
        <div className="setting-item">
            <label htmlFor="minimap">
                <i className="ri-file-list-line"></i>
                Minimap
            </label>
            <label className="toggle-switch">
                <input 
                    type="checkbox" 
                    id="minimap"
                    checked={settings.minimap === 'on'}
                    onChange={(e) => onChange('minimap', e.target.checked ? 'on' : 'off')}
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    </div>
);

const TimerDropdown = ({
    menuRef,
    timerModalTab,
    onTabChange,
    timerSettings,
    onFullReset,
    onStartStopwatch,
    timerInput,
    onTimerInputChange,
    onTimerInputBlur,
    onStartTimer
}) => {
    // Check if timer is running or paused
    const isTimerActiveOrPaused = timerSettings.isActive || timerSettings.time > 0;

    return (
        <div className="timer-dropdown" ref={menuRef}>
            <div className="timer-tabs">
                <button
                    className={`timer-tab-btn ${timerModalTab === 'stopwatch' ? 'active' : ''}`}
                    onClick={() => onTabChange('stopwatch')}
                >
                    <i className="ri-time-line"></i> Stopwatch
                </button>
                <button
                    className={`timer-tab-btn ${timerModalTab === 'timer' ? 'active' : ''}`}
                    onClick={() => onTabChange('timer')}
                >
                    <i className="ri-timer-line"></i> Timer
                </button>
            </div>

            <div className="timer-content">
                {/* STOPWATCH TAB */}
                {timerModalTab === 'stopwatch' && (
                    <button 
                        className="timer-action-btn"
                        onClick={isTimerActiveOrPaused ? onFullReset : onStartStopwatch}
                    >
                        {isTimerActiveOrPaused ? (
                            <><i className="ri-stop-fill"></i> End Stopwatch</>
                        ) : (
                            <><i className="ri-play-fill"></i> Start Stopwatch</>
                        )}
                    </button>
                )}

                {/* TIMER TAB */}
                {timerModalTab === 'timer' && (
                    <>
                        {isTimerActiveOrPaused && timerSettings.mode === 'timer' ? (
                            // Show "End Timer" button if timer is active
                            <button 
                                className="timer-action-btn"
                                onClick={onFullReset}
                            >
                                <i className="ri-stop-fill"></i> End Timer
                            </button>
                        ) : (
                            // Show timer inputs and start button
                            <>
                                <div className="timer-input-group">
                                    <input
                                        type="text"
                                        inputMode="numeric" // Show numeric keyboard on mobile
                                        className="timer-input"
                                        value={timerInput.hours} // Value is now the raw string
                                        onChange={(e) => onTimerInputChange('hours', e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        onBlur={(e) => onTimerInputBlur('hours', e.target.value)} // Validate on blur
                                        maxLength="2"
                                    />
                                    <span>hr</span>
                                    <input
                                        type="text"
                                        inputMode="numeric" // Show numeric keyboard on mobile
                                        className="timer-input"
                                        value={timerInput.minutes} // Value is now the raw string
                                        onChange={(e) => onTimerInputChange('minutes', e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        onBlur={(e) => onTimerInputBlur('minutes', e.target.value)} // Validate on blur
                                        maxLength="2"
                                    />
                                    <span>min</span>
                                </div>
                                <button
                                    className="timer-action-btn"
                                    onClick={onStartTimer}
                                >
                                    <i className="ri-play-fill"></i> Start Timer
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Panel-Tools DIV
const PanelTools = ({ onFold, onMax, isFolded, isMaxed, customClass, vertical = false, foldIcon, unfoldIcon, hideMaximize = false }) => (
    <div className={`panel-tools ${vertical ? 'vertical-tools' : ''} ${customClass}`}>
        {/* Fold/Unfold Button */}
        {!isMaxed && (
            <button className="tool-btn" onClick={onFold} title={isFolded ? "Unfold" : "Fold"}>
                <i className={isFolded ? (unfoldIcon || "ri-expand-up-down-line") : (foldIcon || "ri-contract-up-down-line")}></i>
            </button>
        )}
        
        {/* Maximize/Restore Button - Hidden if hideMaximize is true */}
        {!hideMaximize && (
            <button className="tool-btn" onClick={onMax} title={isMaxed ? "Restore" : "Maximize"}>
                <i className={isMaxed ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
            </button>
        )}
    </div>
);

function Problem(){
    const { problem_id } = useParams();
    const [problemData, setProblemData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_DETAILS[0]);
    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const settingsMenuRef = useRef(null);
    const timerDropdownRef = useRef(null);
    const [allProblems, setAllProblems] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [difficultyValue, setDifficultyValue] = useState("Difficulty");
    // Ref used for GSAP Animation and Fullscreen Functionality
    const container1 = useRef();
    const tl1 = useRef();
    const user = useSelector((state) => state.auth.user);
    // State for Copy Feedback
    const [isCopied, setIsCopied] = useState(false);
    const [activeTestCaseId, setActiveTestCaseId] = useState(0); // Index of the active test case
    const [activeResultId, setActiveResultId] = useState(0); // New state for Result Tab
    // === NEW STATE FOR AI PANEL ===
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
    // === NEW STATE FOR NOTES TAB ===
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    const [activeLeftTab, setActiveLeftTab] = useState("description");
    const [activeRightTab, setActiveRightTab] = useState("testcase");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [output, setOutput] = useState(null); // Stores run/submit results

    // Check if the current problem ID exists in the user's solved array
    const isSolved = user?.problemsSolved?.includes(problem_id);
    const dispatch = useDispatch(); 

    // =========================================================
    // =============== New state for UI controls ===============
    // =========================================================
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState(false);
    const [timerSettings, setTimerSettings] = useState({
        mode: 'stopwatch', // 'stopwatch' or 'timer'
        isActive: false, // Is the timer running? No
        time: 0, // Current time in seconds (counts up for stopwatch, down for timer)
    });
    const [timerModalTab, setTimerModalTab] = useState('stopwatch'); // 'stopwatch' or 'timer'
    const [timerInput, setTimerInput] = useState({
        hours: '00',
        minutes: '15' 
    });
    const [isTimerVisible, setIsTimerVisible] = useState(true);
    const [editorSettings, setEditorSettings] = useState({
        fontSize: 14,
        tabSize: 4,
        wordWrap: 'on',
        lineNumbers: 'on',
        minimap: 'off',
    });

    async function fetchProblemData(){
        setIsLoading(true);

        const response = await axiosClient.get(`/problem/getProblem/${problem_id}`);
        const data = response.data;
        setProblemData(data);

        // Set default code from fetched data
        const defaultLang = LANGUAGE_DETAILS[0]; // Default to C++
        const starterCode = data?.startCode[0]?.initialCode; // starterCode of C++
        setSelectedLanguage(defaultLang);
        setCode(starterCode);

        setIsLoading(false);
    }

    // problem_id is included in the dependency array because each time the user switches
    // to a different problem (via Prev or Next buttons), the problem_id updates.
    // This change should automatically trigger a fresh fetch for the new problem's data.
    useEffect(() => {
        fetchProblemData();
    }, [problem_id]);

    async function fetchAllProblems(){
        const response = await axiosClient.get("/problem/getAllProblems");
        const data = response.data;
        setAllProblems(data);
    }

    useEffect(() => {
        fetchAllProblems();
    }, []);

    const filteredProblems = allProblems.filter((problem) => {
        const matchesSearch = searchValue==="" || problem.title.toLowerCase().includes(searchValue.toLowerCase());
        const matchesDifficulty = difficultyValue==="Difficulty" || problem.difficulty===difficultyValue;

        // The problem is kept ONLY if all two conditions are true
        return matchesSearch && matchesDifficulty;
    });

    // =============================================================================
    // ============ GSAP ANIMATION for left opening problems list panel ============
    // =============================================================================
    useGSAP(() => {
        if(isLoading===true){
            return;
        }
        tl1.current = gsap.timeline({paused: true});

        tl1.current.to(".left-opening-panel", {
            x: 687,
            duration: 0.5
        });

    } , {scope: container1, dependencies:[isLoading]});

    function openPanel(){
        tl1.current.play();
    }

    function closePanel(){
        tl1.current.reverse();
    }

    // ====================================================================
    // ============ Logic for Previous/Next Problem Navigation ============
    // ====================================================================
    // Find the index of the current problem within the `allProblems` list.
    const currentIndex = allProblems.findIndex(
        (p) => p._id === problem_id
    );

    // Get the previous problem's ID. If `currentIndex` is 0 (or -1 if not found),
    // this will be null, disabling the "prev" button.
    const prevProblemId =
        currentIndex > 0 ? allProblems[currentIndex - 1]._id : null;

    // Get the next problem's ID. If `currentIndex` is the last item in the list,
    // this will be null, disabling the "next" button.
    const nextProblemId =
        currentIndex < allProblems.length - 1
            ? allProblems[currentIndex + 1]._id
            : null;
    
    // 4. Handler to navigate to the previous problem
    const handlePrevProblem = () => {
        // If prevProblemId exists, then ->
        if (prevProblemId) {
            navigate(`/problem/${prevProblemId}`);
        }
    };

    // 5. Handler to navigate to the next problem
    const handleNextProblem = () => {
        // If nextProblemId exists, then ->
        if (nextProblemId) {
            navigate(`/problem/${nextProblemId}`);
        }
    };

    // ==================================================
    // ============ Logic for Random Problem ============
    // ==================================================
    // Navigate to a random problem, excluding the current one.
    const handleRandomProblem = () => {
        // Create a list of all problems *except* the current one.
        const otherProblems = allProblems.filter(p => p._id != problem_id);

        // Pick a random index from the new `otherProblems` list.
        // Math.floor(Math.random() * (max - min + 1) + min)
        const randomIndex = Math.floor(Math.random() * otherProblems.length);
        const randomProblemId = otherProblems[randomIndex]._id;

        // Navigate to the chosen problem.
        navigate(`/problem/${randomProblemId}`);
    };

    // =========================================================================
    // ============ Effect to close dropdown/modal on outside click ============
    // =========================================================================
    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target) && !event.target.closest('.navbar-btn[title="Settings"]')) {
                setIsSettingsOpen(false);
            }
            // This now checks for the dropdown ref and *any* button that controls the timer.
            const isTimerControl = event.target.closest('.timer-control-group');
            if (timerDropdownRef.current && !timerDropdownRef.current.contains(event.target) && !isTimerControl) {
                setIsTimerDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ==============================================================
    // ============ Handle language change from dropdown ============
    // ==============================================================
    const handleLanguageChange = (e) => {
        const newLangName = e.target.value;
        const newLangDetails = LANGUAGE_DETAILS.find(
            (l) => l.name === newLangName
        );
        if (newLangDetails && problemData) {
            setSelectedLanguage(newLangDetails);
            const newStartCode = problemData.startCode.find(
                (sc) => sc.language === newLangName
            )?.initialCode;
            setCode(newStartCode);
        }
    };

    // ===========================================
    // ============ Handle code reset ============
    // ===========================================
    const resetCode = () => {
        if (problemData) {
            const originalCode = problemData.startCode.find(
                (sc) => sc.language === selectedLanguage.name
            )?.initialCode;
            setCode(originalCode || "");
        }
    };

    // ===================================================
    // ============ Handle "Run" button click ============
    // ===================================================
    async function handleRun(){
        if (isSubmitting) return;
        setIsSubmitting(true);
        setLoadingAction('run');
        setOutput(null);
        setActiveRightTab("result"); // Switch to result tab

        try {
            const response = await axiosClient.post(
                `/submission/run/${problem_id}`,
                {
                    code: code, // The code that we have typed
                    language: selectedLanguage.name,
                }
            );
            // response.data is the `submissionsArray` from our backend
            setOutput({ type: "run", data: response.data });
        } catch (err) {
            console.error("Run error:", err);
            setOutput({
                type: "error",
                data: err.response?.data?.message || err.message,
            });
        }
        setIsSubmitting(false);
        setLoadingAction(null);
    };

    // ======================================================
    // ============ Handle "Submit" button click ============
    // ======================================================
    async function handleSubmit(){
        if (isSubmitting) return;
        setIsSubmitting(true);
        setLoadingAction('submit');
        setOutput(null);
        setActiveLeftTab("submission_result");

        try {
            const response = await axiosClient.post(
                `/submission/submit/${problem_id}`,
                {
                    code: code,
                    language: selectedLanguage.name,
                }
            );

            // Check if the submission was accepted
            if (response.data.status === "Accepted") {
                // Immediately update Redux state so the badge appears without refresh
                dispatch(markProblemAsSolved(problem_id));
            }

            // response.data is the `submittedResult` document from your backend
            setOutput({ type: "submit", data: response.data });
        } catch (err) {
            console.error("Submit error:", err);
            setOutput({
                type: "error",
                data: err.response?.data?.message || err.message,
            });
        }
        setIsSubmitting(false);
        setLoadingAction(null);
    };

    // ==============================================================
    // ============ NEW: Handle Closing the Accepted Tab ============
    // ==============================================================
    const closeAcceptedTab = (e) => {
        e.stopPropagation(); // Prevent clicking the tab while closing it
        setActiveLeftTab("description"); // Switch back to description
        // Optional: Clear output if you want the tab to disappear completely until next submit
        setOutput(null); 
    };

    // ===========================================================
    // ============ NEW: Handle Closing the Notes Tab ============
    // ===========================================================
    const closeNotesTab = (e) => {
        e.stopPropagation(); // Stop the click from activating the tab while closing it
        setIsNotesOpen(false); // Hide the tab
        if (activeLeftTab === "notes") {
            setActiveLeftTab("description"); // Switch back to description
        }
    };

    // ====================================================================
    // ============ Logic for Maximizing and Folding of panels ============
    // ====================================================================
    // 1. CREATE REFS FOR PANELS
    const leftPanelRef = useRef(null);
    const editorPanelRef = useRef(null);
    const consolePanelRef = useRef(null);

    // 2. TRACK PANEL STATES
    const [layoutState, setLayoutState] = useState({
        left: { collapsed: false, maximized: false },
        editor: { collapsed: false, maximized: false },
        console: { collapsed: false, maximized: false }
    });

    // --- LEFT PANEL LOGIC (Collapase to the left) ---
    const toggleFoldLeft = () => {
        const panel = leftPanelRef.current;
        if (!panel) return;
        if (layoutState.left.collapsed) {
            panel.expand();
            setLayoutState(prev => ({ ...prev, left: { ...prev.left, collapsed: false } }));
        } else {
            panel.collapse();
            setLayoutState(prev => ({ ...prev, left: { ...prev.left, collapsed: true } }));
        }
    };

    const toggleMaximizeLeft = () => {
        const panel = leftPanelRef.current;
        const editor = editorPanelRef.current;
        const consoleP = consolePanelRef.current;

        if (!panel) return;

        if (layoutState.left.maximized) {
            panel.resize(45);
            editor?.resize(65);
            consoleP?.resize(35);
            setLayoutState(prev => ({ ...prev, left: { ...prev.left, maximized: false } }));
        } else {
            panel.resize(100);
            setLayoutState(prev => ({ ...prev, left: { ...prev.left, maximized: true } }));
        }
    };

    // --- EDITOR PANEL LOGIC (Collapse to the top) ---
   const toggleFoldEditor = () => {
        const editor = editorPanelRef.current;
        if (!editor) return;
        if (layoutState.editor.collapsed) {
            editor.expand();
            setLayoutState(prev => ({ ...prev, editor: { ...prev.editor, collapsed: false } }));
        } else {
            editor.collapse();
            setLayoutState(prev => ({ ...prev, editor: { ...prev.editor, collapsed: true } }));
        }
    };

    const toggleMaximizeEditor = () => {
        const left = leftPanelRef.current;
        const editor = editorPanelRef.current;
        const consoleP = consolePanelRef.current;

        if (layoutState.editor.maximized) {
            left.resize(45); editor.resize(65); consoleP.resize(35);
            setLayoutState(prev => ({ ...prev, editor: { ...prev.editor, maximized: false } }));
        } else {
            left.collapse(); consoleP.collapse(); editor.resize(100);
            setLayoutState(prev => ({ ...prev, editor: { ...prev.editor, maximized: true } }));
        }
    };

    // --- CONSOLE PANEL LOGIC (Collapse to the bottom) ---
    const toggleFoldConsole = () => {
        const consoleP = consolePanelRef.current;
        if (!consoleP) return;
        if (layoutState.console.collapsed) {
            consoleP.expand();
            setLayoutState(prev => ({ ...prev, console: { ...prev.console, collapsed: false } }));
        } else {
            consoleP.collapse();
            setLayoutState(prev => ({ ...prev, console: { ...prev.console, collapsed: true } }));
        }
    };

    const toggleMaximizeConsole = () => {
        const left = leftPanelRef.current;
        const editor = editorPanelRef.current;
        const consoleP = consolePanelRef.current;

        if (layoutState.console.maximized) {
            left.resize(45); editor.resize(65); consoleP.resize(35);
            setLayoutState(prev => ({ ...prev, console: { ...prev.console, maximized: false } }));
        } else {
            left.collapse(); editor.collapse(); consoleP.resize(100);
            setLayoutState(prev => ({ ...prev, console: { ...prev.console, maximized: true } }));
        }
    };

    // Helper to handle tab click + expand when collapsed
    const handleConsoleTabClick = (tab) => {
        setActiveRightTab(tab);
        if (layoutState.console.collapsed) {
            toggleFoldConsole(); // Auto-expand
        }
    };

    const handleLeftTabClick = (tab) => {
        setActiveLeftTab(tab);
        if (layoutState.left.collapsed) {
            toggleFoldLeft(); // Auto-expand
        }
    };

    // ========================================================
    // ============ Handle Copy Code Functionality ============
    // ========================================================
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // ========================================================
    // ============ Handle FullScreen Functionality ===========
    // ========================================================
    // The browser gives you a built-in Fullscreen API
    const handleFullscreen = () => {
        // Checks if no element is currently in fullscreen mode.
        if (!document.fullscreenElement) {
            // Requests the browser to make the container1 targeted element fullscreen.
            container1.current?.requestFullscreen()
            // If fullscreen fails (permissions, browser block, etc.), the error is displayed instead of crashing.
            .catch(err => {
                console.error(`Error enabling fullscreen: ${err.message}`);
            });
        } 
        // This else block runs when we ARE already in fullscreen.
        else {
            // Exits fullscreen mode and returns the page back to normal view.
            document.exitFullscreen();
        }
    };

    // -------------------- Helper Components -----------------------

    // ===============================================================
    // ============ Helper component to render difficulty ============
    // ===============================================================
    const DifficultyBadge = ({ difficulty }) => {
        const difficultyClass =
            difficulty === "Easy"
                ? "green"
                : difficulty === "Medium"
                ? "yellow"
                : "red";
        return (
            <div className={`difficulty-DIV2 ${difficulty==="Easy" ? "green-DIV2" : difficulty==="Medium" ? "yellow-DIV2" : "red-DIV2"}`}>
                <span className={`difficulty-badge ${difficultyClass}-txt`}>
                    {difficulty}
                </span>
            </div>
        );
    };

    // ================================================================================
    // ============ Helper component to render problem description content ============
    // ================================================================================
    const renderDescription = () => (
        <div className="description-wrapper">
            <div className="problem-header-section">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <h2 className="problem-title-main">{problemData.title}</h2>
                    
                    {/* Render Badge if Solved */}
                    {isSolved && (
                        <div className="solved-badge">
                            <i className="ri-checkbox-circle-line solved-icon"></i> Solved
                        </div>
                    )}
                </div>
                
                <div className="problem-metadata-row">
                    <DifficultyBadge difficulty={problemData.difficulty} />
                    
                    <div className="meta-divider"></div>

                    {/* Tags & Companies */}
                    <div className="meta-tags-list">
                        {problemData.tags.map((tag) => (
                            <span key={tag} className="meta-tag topic-tag">
                                {tag}
                            </span>
                        ))}
                        {problemData.companyTags.map((tag) => (
                            <span key={tag} className="meta-tag company-tag">
                                <i className="ri-building-line"></i> {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="problem-divider" />

            {/* HTML Description */}
            <div
                className="problem-content-html"
                dangerouslySetInnerHTML={{ __html: problemData.description }}
            />

            {/* Test Cases */}
            <div className="examples-section">
                {problemData.visibleTestCases.map((tc, index) => (
                    <div key={tc._id || index} className="example-card">
                        <div className="example-header">
                            <span className="example-title">Example {index + 1}</span>
                        </div>
                        
                        <div className="example-body">
                            <div className="io-group">
                                <span className="io-label-2">Input:</span>
                                <span className="io-value">{tc.input}</span>
                            </div>
                            <div className="io-group">
                                <span className="io-label-2">Output:</span>
                                <span className="io-value">{tc.output}</span>
                            </div>
                            {tc.explanation && (
                                <div className="io-group explanation">
                                    <span className="io-label-2">Explanation:</span>
                                    <span className="io-text">{tc.explanation}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="description-footer-container">
                <hr className="footer-divider" />

                {/* Static Community/Help Links */}
                <div className="footer-shortcuts">
                    <div className="shortcut-item">
                        <i className="ri-question-line"></i>
                        <span>Get Help</span>
                    </div>
                    <div className="shortcut-item">
                        <i className="ri-bug-line"></i>
                        <span>Report Bug</span>
                    </div>
                    <div className="shortcut-item">
                        <i className="ri-keyboard-line"></i>
                        <span>Shortcuts</span>
                    </div>
                    
                    {/* SHARE PROBLEM BUTTON */}
                    <ShareProblem problemTitle={problemData.title} />
                </div>

                {/* The Professional Copyright Section */}
                <div className="copyright-section">
                    <div className="brand-line">
                        <span>Copyright © 2025 ByteRank. All rights reserved.</span>
                    </div>
                    <div className="legal-links">
                        <span className="legal-link">Terms of Service</span>
                        <span className="sep">|</span>
                        <span className="legal-link">Privacy Policy</span>
                        <span className="sep">|</span>
                        <span className="legal-link">Global (English)</span>
                    </div>
                    <div className="made-with">
                        Made with <i className="ri-heart-fill heart-icon"></i> for coders
                    </div>
                </div>
            </div>
        </div>
    );

    // =====================================================================
    // ============ Helper component to render the Testcase tab ============
    // =====================================================================
    const renderTestcaseTab = () => {
        // If no test cases, show nothing or a placeholder
        if (!problemData.visibleTestCases || problemData.visibleTestCases.length === 0) return null;

        const currentCase = problemData.visibleTestCases[activeTestCaseId];

        return (
            <div className="testcase-container">
                {/* 1. Case Tabs Row */}
                <div className="testcase-tabs-row">
                    {problemData.visibleTestCases.map((_, index) => (
                        <button
                            key={index}
                            className={`testcase-tab-btn ${activeTestCaseId === index ? 'active' : ''}`}
                            onClick={() => setActiveTestCaseId(index)}
                        >
                            Case {index + 1}
                        </button>
                    ))}
                </div>

                {/* 2. Case Content */}
                <div className="testcase-content-box">
                    <div className="io-item">
                        <span className="io-label">Input:</span>
                        <div className="io-box">
                            {currentCase.input}
                        </div>
                    </div>
                    
                    <div className="io-item">
                        <span className="io-label">Expected Output:</span>
                        <div className="io-box">
                            {currentCase.output}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ========================================================================
    // ============ Helper component to render the Test Result tab ============
    // ========================================================================
    const renderResultTab = () => {
        // Only show shimmer effect if action is 'run'
        // (Submit loading is handled in the Left Panel now)
        if (isSubmitting && loadingAction === 'run') {
            return <ResultShimmer />;
        }

        // If we click on submit, then we show nothing in the console
        // as our Submit result will now be displayed in the left panel in the Accepted Tab.
        // So, show a Placeholder instead in the console in case of Submission.
        // And If we have a RUN result, we display it in the console.
        if (!output || output.type === 'submit') {
            return (
                <div className="result-placeholder">
                    <i className="ri-flask-line" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.2 }}></i>
                    <p className="majboori-class">Run your code to see test results.</p>
                </div>
            );
        }

        //  Render only the RUN results in the console ---
        if (output.type === "run") {
            const results = output.data;
            const currentResult = results[activeResultId];
            const currentTestCase = problemData.visibleTestCases[activeResultId];
            
            // Determine overall status (simple check: if current case passed)
            const isAccepted = currentResult.status_id === 3; // 3 is typically Judge0 ID for Accepted
            const statusLabel = isAccepted ? "Accepted" : "Wrong Answer";
            const statusClass = isAccepted ? "text-green" : "text-red";

            return (
                <div className="run-results-container">
                    {/* Status Header */}
                    <div className="result-status-header">
                        <span className={`status-title ${statusClass}`}>{statusLabel}</span>
                        <span className="runtime-text">Runtime: {currentResult.time || 0} s</span>
                    </div>

                    {/* Case Tabs */}
                    <div className="testcase-tabs-row">
                        {results.map((res, index) => {
                            const passed = res.status_id === 3;
                            return (
                                <button
                                    key={index}
                                    className={`testcase-tab-btn ${activeResultId === index ? 'active' : ''} ${passed ? 'pass-dot' : 'fail-dot'}`}
                                    onClick={() => setActiveResultId(index)}
                                >
                                    {/* Green/Red Dot Indicator */}
                                    <span className={`dot ${passed ? 'bg-green' : 'bg-red'}`}></span>
                                    Case {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Result Details */}
                    <div className="testcase-content-box">
                        {/* Input */}
                        <div className="io-item">
                            <span className="io-label">Input:</span>
                            <div className="io-box">
                                {currentTestCase.input}
                            </div>
                        </div>

                        {/* User Output */}
                        <div className="io-item">
                            <span className="io-label">Output:</span>
                            <div className="io-box">
                                {currentResult.stdout !== null ? currentResult.stdout : "No output (or error)"}
                            </div>
                        </div>

                        {/* Expected Output */}
                        <div className="io-item">
                            <span className="io-label">Expected:</span>
                            <div className="io-box">
                                {currentTestCase.output}
                            </div>
                        </div>
                        
                        {/* Optional: StdErr if exists */}
                        {currentResult.stderr && (
                             <div className="io-item">
                                <span className="io-label" style={{color: 'var(--brand-red-light)'}}>Standard Error:</span>
                                <div className="io-box error-text">
                                    {currentResult.stderr}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // --- Render ERROR results ---
        if (output.type === "error") {
            return (
                <div className="result-error-container">
                    <div className="result-header error">
                        <i className="ri-error-warning-fill"></i>
                        <span>Error</span>
                    </div>
                    <div className="error-box">
                        <pre>{output.data}</pre>
                    </div>
                </div>
            );
        }
    };

    // ========================================
    // ============ SETTINGS LOGIC ============
    // ========================================
    const handleEditorSettingChange = useCallback((setting, value) => {
        setEditorSettings(prev => ({ ...prev, [setting]: value }));
    }, []);

    // =============================================================
    // ============ Helper Component for Timer Settings ============
    // =============================================================
    // This effect runs whenever the timer's `isActive` state changes.
    useEffect(() => {
        let interval = null;

        if (timerSettings.isActive) {
            // Start an interval that ticks every 1000ms (1 second)
            interval = setInterval(() => {
                setTimerSettings(prev => {
                    // Stopwatch mode: count up
                    if (prev.mode === 'stopwatch') {
                        return { ...prev, time: prev.time + 1 };
                    }
                    
                    // Timer mode: count down
                    if (prev.mode === 'timer') {
                        // If time is up, stop the timer
                        if (prev.time <= 1) {
                            // You could add an alert here
                            alert("Time's up!");
                            return { ...prev, isActive: false, time: 0 };
                        }
                        // Otherwise, keep counting down
                        return { ...prev, time: prev.time - 1 };
                    }
                    
                    return prev;
                });
            }, 1000);
        }
        // This cleanup function runs when isActive becomes false
        // or when the component unmounts.
        return () => clearInterval(interval);
    }, [timerSettings.isActive]); // Re-run this effect only when isActive changes

    // Time formatting function -> Formats a given number of seconds into HH:MM:SS
    const formatDisplayTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const paddedSeconds = String(seconds).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        // --- NEW: Always pad hours ---
        const paddedHours = String(hours).padStart(2, '0');

        // --- MODIFIED: Always return HH:MM:SS ---
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    };

    // Called from navbar to pause/resume
    const handleTogglePause = useCallback(() => {
        setTimerSettings(prev => ({ ...prev, isActive: !prev.isActive }));
    }, []);

    // Called from dropdown to start stopwatch
    const handleStartStopwatch = useCallback(() => {
        setTimerSettings({
            mode: 'stopwatch',
            time: 0,
            isActive: true
        });
        setIsTimerDropdownOpen(false);
    }, []);

    // Called from dropdown to start timer
    const handleStartTimer = useCallback(() => {
        const hours = parseInt(timerInput.hours, 10) || 0;
        const minutes = parseInt(timerInput.minutes, 10) || 0;
        const totalSeconds = (hours * 3600) + (minutes * 60);

        if (totalSeconds > 0) {
            setTimerSettings({
                mode: 'timer',
                time: totalSeconds,
                isActive: true
            });
            setIsTimerDropdownOpen(false);
        }
    }, [timerInput]);

    // Called from dropdown to reset everything
    const handleFullReset = useCallback(() => {
        setTimerSettings({
            mode: 'stopwatch',
            isActive: false,
            time: 0
        });
        setTimerModalTab('stopwatch'); // Reset tab to default
        setIsTimerVisible(true);
    }, []);

    // Handles the number inputs in the timer tab
    const handleTimerInputChange = useCallback((unit, value) => {
        // Allow only numeric characters, limit length to 2
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 2);

        if (unit === 'hours') {
            setTimerInput(prev => ({ ...prev, hours: numericValue }));
        } else if (unit === 'minutes') {
            setTimerInput(prev => ({ ...prev, minutes: numericValue }));
        }
    }, []);

    // --- NEW: Handle validation and padding when user clicks away ---
    const handleTimerInputBlur = useCallback((unit, value) => {
        let numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            numValue = 0; // Default to 0 if empty or invalid
        }

        if (unit === 'hours') {
            numValue = Math.min(numValue, 23); // Enforce max 23 hours
            setTimerInput(prev => ({ ...prev, hours: String(numValue).padStart(2, '0') }));
        } else if (unit === 'minutes') {
            numValue = Math.min(numValue, 59); // Enforce max 59 minutes
            setTimerInput(prev => ({ ...prev, minutes: String(numValue).padStart(2, '0') }));
        }
    }, []);
    
    // ==============================================================
    // ============ Helper component for loading spinner ============
    // ==============================================================
    const LoadingSpinner = () => (
        <div className="spinner-preview-container">
            <div className="spinner"></div>
        </div>
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
        <div className="problem-page-container" ref={container1}>
            {/* ===================== */}
            {/* ====== NAVBAR ======= */}
            {/* ===================== */}
            <div className="problem-navbar-container">
                <div className="navbar-section left">
                    <button className="navbar-btn" onClick={() => navigate('/problems')}>
                        <i className="ri-arrow-left-line"></i> Back
                    </button>
                    <button className="navbar-btn" onClick={openPanel}>
                        <i className="ri-menu-2-line"></i>
                        <span className="PROBLEMS-LIST-SPAN">Problem List</span>
                    </button>
                    <button
                        className="navbar-btn"
                        title="Previous Problem"
                        onClick={handlePrevProblem}
                        // Disable this btn if prevProblemId does not exist
                        disabled={!prevProblemId}
                    >
                        <i className="ri-arrow-left-s-fill"></i>
                    </button>
                    <button
                        className="navbar-btn"
                        title="Next Problem"
                        onClick={handleNextProblem}
                        // Disable this btn if nextProblemId does not exist
                        disabled={!nextProblemId}
                    >
                        <i className="ri-arrow-right-s-fill"></i>
                    </button>
                    <button className="navbar-btn" title="Random Problem" onClick={handleRandomProblem}>
                        <img src="/shuffle-icon.png" className="shuffle-icon"></img>
                    </button>
                </div>

                <div className="navbar-section center">
                    <div className="run-submit-wrapper">
                        {isSubmitting ? (
                            /* Combined Status Pill */
                            <div className="action-status-pill">
                                <div className="status-dot"></div>
                                <span>
                                    {loadingAction === 'run' ? 'Running...' : 'Submitting...'}
                                </span>
                            </div>
                        ) : (
                            /* Standard Buttons */
                            <>
                                {/* RUN BUTTON */}
                                <button
                                    className="navbar-btn run-btn"
                                    onClick={handleRun}
                                >
                                    <i className="ri-play-fill run-icon"></i>
                                    Run
                                </button>
                                {/* SUBMIT BUTTON */}
                                <button
                                    className="navbar-btn submit-btn"
                                    onClick={handleSubmit}
                                >
                                    <i className="ri-upload-cloud-line submit-icon"></i>
                                    Submit
                                </button>
                            </>
                        )}
                    </div>

                    {/* NOTES BUTTON */}
                    <button
                        className={`navbar-btn notes-btn ${activeLeftTab === 'notes' ? 'active-nav-btn' : ''}`}
                        title="My Notes"
                        onClick={() => {
                            // 1. Expand panel if collapsed
                            if (layoutState.left.collapsed){
                                toggleFoldLeft();
                            }
                            // 2. Enable the tab visibility
                            setIsNotesOpen(true);
                            // 3. Switch to the tab
                            setActiveLeftTab("notes");
                        }}
                    >
                        <i className="ri-sticky-note-line notes-icon"></i>
                        <span>Notes</span>
                    </button>

                    {/* AI BUTTON */}
                    <button 
                        onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                        className={`navbar-btn ai-trigger-btn ${isAIPanelOpen ? 'active' : ''}`} 
                    >
                        <i className="ri-shining-2-line ai-icon"></i>
                        <span>Ask AI</span>
                    </button>
                </div>

                <div className="navbar-section right">
                    <div className="timer-control-group">
                        {!timerSettings.isActive && timerSettings.time === 0 ? (
                            // STATE 1: Initial (Timer Off)
                            // Show the default timer button that opens the dropdown
                            <button
                                className="navbar-btn"
                                title="Timer"
                                onClick={() => setIsTimerDropdownOpen(prev => !prev)}
                            >
                                <i className="ri-timer-line timer-icon"></i>
                            </button>
                        ) : (
                            // STATE 2: Active or Paused
                            // Show the active controls (Pause/Play, Time, Reset)
                            <div className="navbar-timer-active">
                                <button
                                    className="navbar-btn"
                                    title={timerSettings.isActive ? "Pause" : "Resume"}
                                    onClick={handleTogglePause}
                                >
                                    <i className={timerSettings.isActive ? "ri-pause-fill" : "ri-play-fill"}></i>
                                </button>

                                {/* --- NEW: Hide/Show Logic --- */}
                                {isTimerVisible ? (
                                    <>
                                        <span
                                            className="timer-display"
                                            // --- NEW: Dynamic coloring ---
                                            style={{
                                                color: timerSettings.mode === 'timer' && timerSettings.time <= 60
                                                    ? 'var(--brand-red-light)' // Warning color
                                                    : 'var(--brand-blue-light)' // Default active color
                                            }}
                                            onClick={() => setIsTimerDropdownOpen(prev => !prev)}
                                        >
                                            {formatDisplayTime(timerSettings.time)}
                                        </span>
                                        <button 
                                            className="navbar-btn" 
                                            title="Hide Timer" 
                                            onClick={() => setIsTimerVisible(false)}
                                        >
                                            <i className="ri-arrow-right-s-line"></i>
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="navbar-btn" 
                                        title="Show Timer" 
                                        onClick={() => setIsTimerVisible(true)}
                                    >
                                        <i className="ri-arrow-left-s-line"></i>
                                    </button>
                                )}

                                <button
                                    className="navbar-btn"
                                    title="Reset"
                                    onClick={() => setIsTimerDropdownOpen(true)}
                                >
                                    <i className="ri-refresh-line"></i>
                                </button>
                            </div>
                        )}
                        {/* The dropdown is positioned relative to this parent div */}
                        {isTimerDropdownOpen && (
                            <TimerDropdown
                                menuRef={timerDropdownRef}
                                timerModalTab={timerModalTab}
                                onTabChange={setTimerModalTab}
                                timerSettings={timerSettings}
                                onFullReset={handleFullReset}
                                onStartStopwatch={handleStartStopwatch}
                                timerInput={timerInput}
                                onTimerInputChange={handleTimerInputChange}
                                onTimerInputBlur={handleTimerInputBlur}
                                onStartTimer={handleStartTimer}
                            />
                        )}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button className="navbar-btn" title="Settings" onClick={() => setIsSettingsOpen(prev => !prev)}>
                            <i className="ri-settings-3-line settings-icon"></i>
                        </button>
                        {isSettingsOpen && (
                            <SettingsDropdown 
                                menuRef={settingsMenuRef}
                                settings={editorSettings}
                                onChange={handleEditorSettingChange}
                            />
                        )}
                    </div>
                    
                    {/* Profile Menu */}
                    <div className="editor-navbar-profile-menu">
                        {user?.role === "admin" ? (
                            <Link to="/adminPanel">
                                <button className="admin-btn2">Admin Panel</button>
                            </Link>
                        ) : (
                            <ProfileMenuForEditor/>
                        )}
                    </div>
                    
                    {/* Premium Button */}
                    <Link to="/premium">
                        <button className="premium-features2">Premium</button>
                    </Link>
                </div>
            </div>

            {/* =============================================== */}
            {/* ====== LEFT OPENING PROBLEMS LIST PANEL ======= */}
            {/* =============================================== */}
            <div className="left-opening-panel">
                <div className="panel-header">
                    <h2 className="panel-header-txt" onClick={() => navigate("/problems")}>Problem List</h2>
                    <i className="ri-arrow-right-s-line panel-header-icon"></i>
                </div>
                <hr className="panel-hr-tag"></hr>
                {/* Our Problems List */}
                <div className="problems-list-container3">
                    <div className="all-filters3">
                        <div className="icon-input">
                            <i className="ri-search-line search-icon"></i>
                            <input type="text" className="problem-input3" name="searchProblems" placeholder="Search problems..." value={searchValue} onChange={(event) => setSearchValue(event.target.value)}></input>
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
                    </div>
                    <div className="start-practicing3">
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
                                    <Link to={`/problem/${problem._id}`} className="remove-line" key={problem._id}>
                                    <div className="problem3">
                                        <div className="numbering">
                                            <p className="integer">{index + 1}</p>
                                        </div>
                                        <div className="main-problem">
                                            <p className="problem-title">{problem?.title}</p>
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
                                                <div className="solved-badge-corner-2">Solved</div>
                                            )}
                                        </div>
                                    </div>
                                    </Link>
                                )
                            })
                        }
                    </div>
                </div>
                {/* Cross Icon */}
                <i className="ri-close-circle-fill panel-close-icon" onClick={closePanel}></i>
            </div>

            {/* --- Main Resizable Content --- */}
            <main className="problem-main-content">
                <PanelGroup direction="horizontal">
                    {/* ================================== */}
                    {/* ====== Left Panel: Problem ======= */}
                    {/* ================================== */}
                    <Panel ref={leftPanelRef} id="left-panel" order={1} defaultSize={isAIPanelOpen ? 25 : 45} minSize={10} collapsible collapsedSize={4} className="smooth-transition">
                        <div className="problem-description-panel panel-wrapper">
                            {/* LEFT PANEL CONTROLS */}
                            <PanelTools 
                                customClass="tools-left"
                                vertical={layoutState.left.collapsed}
                                onFold={toggleFoldLeft} 
                                onMax={toggleMaximizeLeft}
                                isFolded={layoutState.left.collapsed}
                                isMaxed={layoutState.left.maximized}
                                foldIcon="ri-arrow-left-s-line" 
                                unfoldIcon="ri-arrow-right-s-line"
                                hideMaximize={layoutState.left.collapsed} 
                            />
                            {/* ------------------------------ */}
                            {/* When Description Panel is not collpased, show all the content */}
                            {!layoutState.left.collapsed ? (
                                <>
                                <nav className="tabs-nav">
                                    <button
                                        className={`tab-btn ${activeLeftTab === "description" ? "active" : ""}`}
                                        onClick={() => setActiveLeftTab("description")}
                                    >
                                        <i className="ri-file-text-line description-ICON"></i> Description
                                    </button>
                                    <button
                                        className={`tab-btn ${activeLeftTab === "editorial" ? "active" : ""}`}
                                        onClick={() =>setActiveLeftTab("editorial")}
                                    >
                                        <i className="ri-lightbulb-line editorial-ICON"></i> Editorial
                                    </button>
                                    {/* Notes Tab (Visible only when clicked on Notes button) */}
                                    {isNotesOpen && (
                                        <button
                                            className={`tab-btn ${activeLeftTab === "notes" ? "active" : ""}`}
                                            onClick={() => setActiveLeftTab("notes")}
                                        >
                                        <i className="ri-sticky-note-line note-ICON" style={{ color: activeLeftTab === "notes" ? '#00d4ff' : '' }}></i> 
                                            Notes
        
                                            {/* CROSS ICON */}
                                            <span 
                                                className="tab-close-btn" 
                                                onClick={closeNotesTab}
                                                title="Close Notes"
                                            >
                                                <i className="ri-close-line"></i>
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        className={`tab-btn ${activeLeftTab === "submissions" ? "active" : ""}`}
                                        onClick={() =>setActiveLeftTab("submissions")}
                                    >
                                        <i className="ri-check-double-line submission-ICON"></i> Submissions
                                    </button>
                                    {/* Submission Result Tab (Visible only when Submitting or Result exists) */}
                                    {(isSubmitting && loadingAction === 'submit' || (output?.type === 'submit' && activeLeftTab === 'submission_result')) && (
                                        <button
                                            className={`tab-btn ${activeLeftTab === "submission_result" ? "active" : ""}`}
                                            onClick={() =>setActiveLeftTab("submission_result")}
                                        >
                                            <i className="ri-trophy-line trophy-ICON-2"></i> Accepted
                                            {/* The Close Cross */}
                                            <span 
                                                className="tab-close-btn" 
                                                onClick={closeAcceptedTab}
                                                title="Close Result"
                                            >
                                                <i className="ri-close-line" style={{fontSize: '14px'}}></i>
                                            </span>
                                        </button>
                                    )}
                                </nav>
                                {/* For Rendering Content inside the tabs */}
                                <div className="tab-content">
                                    {activeLeftTab === "description" &&
                                        renderDescription()
                                    }
                                    {/* EDITORIAL SECTION */}
                                    {activeLeftTab === "editorial" && (
                                        <Editorial problemId={problemData._id} />
                                    )}
                                    {/* NOTES SECTION */}
                                    {activeLeftTab === "notes" && (
                                        <NotesPanel problemId={problemData._id} />
                                    )}
                                    {/* SUBMISSIONS SECTION */}
                                    {activeLeftTab === "submissions" && (
                                        <SubmissionsTab problemId={problemData._id} />
                                    )}
                                    {activeLeftTab === "submission_result" && (
                                        isSubmitting && loadingAction === 'submit' 
                                        ? <div className="spinner-container-tab"><div className="spinner"></div><p>Judge is evaluating...</p></div>
                                        : output?.type === 'submit' && <SubmissionResult result={output.data} />
                                    )}
                                </div>
                                </>
                            ) : (
                                // If the Desription Panel is collapsed to the left, then show this vertical strip
                                <div className="vertical-tabs-container">
                                    <div className="vertical-tabs-list">
                                        <button className={`v-tab-btn ${activeLeftTab === "description" ? "active" : ""}`} onClick={() => handleLeftTabClick("description")}>
                                            <i className="ri-file-text-line description-ICON"></i>
                                            <span>Description</span>
                                        </button>
                                        <button className={`v-tab-btn ${activeLeftTab === "editorial" ? "active" : ""}`} onClick={() => handleLeftTabClick("editorial")}>
                                            <i className="ri-lightbulb-line editorial-ICON"></i>
                                            <span>Editorial</span>
                                        </button>
                                        {isNotesOpen && (
                                            <button 
                                                className={`v-tab-btn ${activeLeftTab === "notes" ? "active" : ""}`} 
                                                onClick={() => handleLeftTabClick("notes")}
                                            >
                                                <i className="ri-sticky-note-line note-ICON"></i>
                                                <span>Notes</span>
                                            </button>
                                        )}
                                        <button className={`v-tab-btn ${activeLeftTab === "submissions" ? "active" : ""}`} onClick={() => handleLeftTabClick("submissions")}>
                                            <i className="ri-check-double-line submission-ICON"></i>
                                            <span>Submissions</span>
                                        </button>
                                        {(output?.type === 'submit') && (
                                            <button className={`v-tab-btn ${activeLeftTab === "submission_result" ? "active" : ""}`} onClick={() => handleLeftTabClick("submission_result")}>
                                                <i className="ri-trophy-line trophy-ICON-2"></i>
                                                <span>Accepted</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>

                    <PanelResizeHandle className="resize-handle-vertical" />

                    {/* ================================== */}
                    {/* ====== Right Panel: Editor ======= */}
                    {/* ================================== */}
                    <Panel id="middle-panel" order={2} defaultSize={isAIPanelOpen ? 25 : 55} minSize={10}>
                        <PanelGroup direction="vertical">
                            {/* Panel 2a: Code Editor */}
                            <Panel ref={editorPanelRef} id="editor-inner" order={1} defaultSize={65} minSize={10} collapsible collapsedSize={8} className="smooth-transition">
                                <div className="editor-panel panel-wrapper">
                                    
                                    <div className="editor-header-primary">
                                        <div className="header-title">
                                            <i className="ri-code-s-slash-line"></i>
                                            <span className="code-HEADER">Code</span>
                                        </div>

                                        {/* EDITOR CONTROLS */}
                                        <PanelTools 
                                            customClass="tools-editor-top"
                                            onFold={toggleFoldEditor} 
                                            onMax={toggleMaximizeEditor}
                                            isFolded={layoutState.editor.collapsed}
                                            isMaxed={layoutState.editor.maximized}
                                            /* Use Up Arrow because it folds upwards */
                                            foldIcon="ri-arrow-up-s-line" 
                                            unfoldIcon="ri-arrow-down-s-line"
                                        />
                                    </div>
                                    {/* ------------------------- */}
                                    {!layoutState.editor.collapsed && (
                                        <>
                                        <div className="editor-header-secondary">
                                            <div className="secondary-left">
                                                <LanguageDropdown 
                                                    selectedLanguage={selectedLanguage}
                                                    languages={LANGUAGE_DETAILS}
                                                    onChange={(name) => handleLanguageChange({ target: { value: name } })}
                                                />
                                            </div>
                                            <div className="secondary-right">
                                                {/* Reset Code Button */}
                                                <button
                                                    className="editor-action-btn"
                                                    onClick={resetCode}
                                                    title="Reset to default code"
                                                >
                                                    <i className="ri-refresh-line"></i>
                                                </button>
                                                {/* Copy Button */}
                                                <button 
                                                    className="editor-action-btn" 
                                                    onClick={handleCopy} 
                                                    title="Copy Code"
                                                >
                                                    {isCopied ? (
                                                        <i className="ri-check-line" style={{ color: 'var(--brand-green)' }}></i>
                                                    ) : (
                                                        <i className="ri-file-copy-line"></i>
                                                    )}
                                                </button>
                                                {/* 3. Fullscreen Button */}
                                                <button 
                                                    className="editor-action-btn" 
                                                    onClick={handleFullscreen} 
                                                    title="Fullscreen"
                                                >
                                                    <i className="ri-expand-diagonal-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="monaco-wrapper-spaced">
                                            <Editor
                                                height="100%"
                                                // Initial Language to be shown
                                                language={selectedLanguage.monaco}
                                                value={code}
                                                onChange={(value) => setCode(value)}
                                                theme="vs-dark" // LeetCode's default dark theme
                                                options={{
                                                    ...editorSettings,
                                                    minimap: { enabled: editorSettings.minimap === 'on' },
                                                    scrollBeyondLastLine: false,
                                                    contextmenu: false,
                                                    automaticLayout: true,
                                                    insertSpaces: true,
                                                    glyphMargin: false,
                                                    folding: true,
                                                    lineDecorationsWidth: 10,
                                                    renderLineHighlight: 'line',
                                                    selectOnLineNumbers: true,
                                                    roundedSelection: false,
                                                    readOnly: false,
                                                    cursorStyle: 'line',
                                                    mouseWheelZoom: false,
                                                    lineNumbersMinChars: 5, // Increase slightly to accommodate the new padding
                                                    padding: {bottom: 50}
                                                }}
                                            />
                                        </div>
                                        </>
                                    )}
                                </div>
                            </Panel>

                            <PanelResizeHandle className="resize-handle-horizontal" />

                            {/* Panel 2b: Testcase/Output */}
                            <Panel ref={consolePanelRef} id="console-inner" order={2} defaultSize={35} minSize={10} collapsible collapsedSize={8} className="smooth-transition">
                                <div className="console-panel panel-wrapper">
                                    {/* CONSOLE CONTROLS */}
                                    <PanelTools 
                                        customClass="tools-console"
                                        onFold={toggleFoldConsole} 
                                        onMax={toggleMaximizeConsole}
                                        isFolded={layoutState.console.collapsed}
                                        isMaxed={layoutState.console.maximized}
                                        foldIcon="ri-arrow-down-s-line" 
                                        unfoldIcon="ri-arrow-up-s-line" 
                                    />
                                    {/* --------------------- */}
                                    {!layoutState.console.collapsed ? (
                                        <>
                                        <nav className="tabs-nav console-tabs">
                                            <button
                                                className={`tab-btn ${activeRightTab === "testcase" ? "active" : ""}`}
                                                onClick={() => setActiveRightTab("testcase")}
                                            >
                                                <i className="ri-file-list-line testcase-ICON"></i> 
                                                Testcase
                                            </button>
                                            <button
                                                className={`tab-btn ${activeRightTab === "result" ? "active" : ""}`}
                                                onClick={() => setActiveRightTab("result")}
                                            >
                                                {/* Conditional Rendering: Show Loader if running, else show Flask icon */}
                                                {isSubmitting && loadingAction === 'run' ? (
                                                    <i className="ri-loader-4-line spin-loader"></i> 
                                                ) : (
                                                    <i className="ri-flask-line testResults-ICON"></i> // Beaker Icon
                                                )} 
                                                Test Result
                                            </button>
                                        </nav>
                                        <div className="console-content">
                                            {activeRightTab === "testcase" &&
                                                renderTestcaseTab()}
                                            {activeRightTab === "result" &&
                                                renderResultTab()}
                                        </div>
                                        <div className="console-footer">
                                            <i className="ri-terminal-line terminal-ICON"></i>
                                            <span>Console</span>
                                        </div>
                                        </>
                                    ) : (
                                        /* === COLLAPSED CONSOLE: SHOW TABS === */
                                        <div className="collapsed-console-tabs">
                                            <button 
                                                className={`collapsed-tab-btn ${activeRightTab === "testcase" ? "active" : ""}`} 
                                                onClick={() => handleConsoleTabClick("testcase")}
                                            >
                                                <i className="ri-file-list-line"></i> Testcase
                                            </button>
                                            <button 
                                                className={`collapsed-tab-btn ${activeRightTab === "result" ? "active" : ""}`} 
                                                onClick={() => handleConsoleTabClick("result")}
                                            >
                                                {isSubmitting && loadingAction === 'run' ? <i className="ri-loader-4-line spin-loader"></i> : <i className="ri-flask-line"></i>}
                                                Test Result
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    {/* ======================================== */}
                    {/* ====== Far Right Panel: Orion AI ======= */}
                    {/* ======================================== */}
                    {isAIPanelOpen && (
                        <>
                            <PanelResizeHandle className="resize-handle-vertical" />
                            <Panel id="ai-panel" order={3} defaultSize={50} minSize={15} maxSize={50} className="smooth-transition">
                                <ChatWithAI onClose={() => setIsAIPanelOpen(false)} problem={problemData} />
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </main>
        </div>
        </>
    )
}

export default Problem;

