import { useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from "../utils/axiosClient";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Default Styles

// --- QUILL CONFIGURATION ---
// modules defines which tools appear inside the editor toolbar.
const modules = {
    toolbar: [
        // Adds dropdown for Heading 1, Heading 2, Normal text
        [{ 'header': [1, 2, false] }],
        // Basic text formatting
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        // Ordered & unordered lists
        [{'list': 'ordered'}, {'list': 'bullet'}],
        // Add hyperlinks
        ['link'],
        // Removes all formatting (convert to plain text)
        ['clean']
    ],
};

// Controls which text formats are allowed & saved
const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet',
    'link'
];

const NotesPanel = ({ problemId }) => {
    // A content useState variable to store our notes content
    const [content, setContent] = useState("");
    // A status useState variable used to display the real-time state of the notes 
    // (loading --> initial load, idle, saving, saved and error).
    const [status, setStatus] = useState('loading');
    // Stores the timeout ID returned by setTimeout function
    const timerRef = useRef(null);

    async function fetchNote() {
        if (!problemId) return;

        try {
            setStatus("loading");
            const response = await axiosClient.get(`/note/getNote/${problemId}`);
                
            // If note exists, set it. If not, empty string.
            const noteContent = response.data.content || "";
            // Display the notes content on the UI
            setContent(noteContent);

            setStatus("idle"); // Stop loading, show textarea
        } 
        catch (error) {
            console.log("Error fetching notes:", error.message);
            // Display the error on UI
            setStatus("error");
        }
    };

    useEffect(() => {
        fetchNote();
    }, [problemId]);

    // Define the Save Function
    async function saveNote(newContent) {
        try {
            setStatus("saving");

            await axiosClient.post("/note/saveNotes", {problemId: problemId, content: newContent });
            setStatus("saved");
            
            // Revert to "idle" visually after 2 seconds
            setTimeout(() => setStatus("idle"), 2000);
        } 
        catch (error) {
            console.log("Error saving note:", error.message);
            setStatus("error");
        }
    };

    const handleChange = (content) => {
        // React Quill's onChange returns the content string directly
        setContent(content);

        // ====== DEBOUNCING LOGIC (Optimization Technique) ======

        // Clear previous timer if any
        if (timerRef.current){
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // Start a new timer and store its timeout ID in timerRef.
        // Why store the timeout ID? Because it allows us to clear this timer later, 
        // which we have done above.
        timerRef.current = setTimeout(() => {
            // Wait 3s after typing stops and then call this saveNote function
            saveNote(content);
        }, 3000);
    };

    return (
        <div className="notes-panel-container">
            {/* Toolbar */}
            <div className="notes-toolbar">
                <div className="notes-title">
                    <i className="ri-sticky-note-line"></i>
                    <span>My Notes</span>
                </div>
                
                {/* Status Badge - Only shows Saving/Saved/Error here. 
                We hide 'loading' from here because we show the big spinner instead. */}
                <div className={`save-status ${status}`}>
                    {status === 'saving' && <span>Saving...</span>}
                    {status === 'saved' && <span>Saved <i className="ri-check-line"></i></span>}
                    {status === 'error' && <span className="error-text">Sync Failed</span>}
                </div>
            </div>

            {/* Content Area */}
            {status === 'loading' ? (
                <div className="notes-center-loader">
                    <i className="ri-loader-4-line spin"></i>
                </div>
            ) : (
                // Wrapper div for CSS scoping
                <div className="quill-editor-container">
                    <ReactQuill 
                        theme="snow"
                        // Just like other input elements, we also store React Quill’s value in a useState 
                        // variable and then apply the onChange handler.
                        value={content}
                        onChange={handleChange}
                        modules={modules}
                        formats={formats}
                        placeholder="Write your logic, complexity analysis, or edge cases here..."
                    />
                </div>
            )}
            
            <div className="notes-footer">
                Rich Text Editor Enabled
            </div>
        </div>
    );
};

export default NotesPanel;