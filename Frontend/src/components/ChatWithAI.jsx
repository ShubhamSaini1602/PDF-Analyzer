import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from "../utils/axiosClient";
import Mermaid from './Mermaid';

// IMPORT THE FORMATTING LIBRARIES
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // VS Code Dark Theme

// IMPORT MATH FORMATTING LIBRARIES
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Loads the math fonts (from katex library)

// IMPORT THE GFM PLUGIN
import remarkGfm from 'remark-gfm';

// --- SPEECH RECOGNITION IMPORTS ---
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// --- Custom Component for the Code Block with Copy Button ---
// This component takes two props:
// 1. language: e.g., "javascript", "cpp"
// 2. value: The actual code text inside the block
const CodeBlock = ({ language, value }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="code-block-container">
            {/* Header with Language Name and Copy Button */}
            <div className="code-block-header">
                <span className="code-lang">{language || 'text'}</span>
                <button onClick={handleCopy} className="copy-btn" title="Copy code">
                    {isCopied ? (
                        <><i className="ri-check-line"></i> Copied!</>
                    ) : (
                        <><i className="ri-file-copy-line"></i> Copy</>
                    )}
                </button>
            </div>

            {/* The Code Highlighter */}
            {/* SyntaxHighlighter is the library that colors the code text */}
            <SyntaxHighlighter
                style={vscDarkPlus} // Sets the color theme (VS Code Dark)
                language={language} // Tells it how to color (e.g., use JS rules or C++ rules)
                PreTag="div" // Renders the code inside a <div> instead of a <pre> tag (fixes some layout issues)
                customStyle={{ margin: 0, borderRadius: '0 0 8px 8px' }} // Remove default margin, round bottom only
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

const ChatWithAI = ({ onClose, problem }) => {
    const { register, handleSubmit, reset, setValue } = useForm();
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    // Track if AI is thinking
    const [isLoading, setIsLoading] = useState(false);
    // A useRef to track cancellation state
    const isCanceling = useRef(false);

    // transcript: The real-time text string
    // listening: Boolean, true if the mic is active
    // resetTranscript: Clears the current speech transcript and resets it to an empty string
    // browserSupports...: Boolean, true if the user's browser supports speech recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // --- SYNC SPEECH TO INPUT ---
    useEffect(() => {
        if (isCanceling.current) return;

        if (transcript) {
            // Update the input value
            setValue('message', transcript);
            
            // Manually trigger the auto-resize logic so the box grows as you speak
            if (textareaRef.current) {
                // Reset height to auto to shrink if text is deleted
                textareaRef.current.style.height = 'auto';
                // Set height to scrollHeight to expand
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        }
    }, [transcript, setValue]);

    // Initial dummy state
    const [messages, setMessages] = useState([
        { role: "model", parts:[{text: "Hi, I'm Orion! I can help you debug code, explain concepts, or generate test cases. How can I assist you today?"}] },
    ]);

    // Auto-scroll to the bottom 
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        
        // Only scroll to bottom if the LAST message was from the USER.
        // This ensures the user sees their own question, but doesn't get 
        // dragged down when the long AI answer arrives.
        if (lastMessage.role === 'user') {
            scrollToBottom();
        }
    }, [messages]);

    // We also want to scroll to bottom when the loading effect appears.
    useEffect(() => {
        if (isLoading) {
            scrollToBottom();
        }
    }, [isLoading]);

    const markdownComponents = useMemo(() => ({
        // Whenever ReactMarkdown sees text wrapped in backticks (`...` or ```...```),
        // it treats that section as code. So to control how this code is displayed,
        // we’ll use the built-in code handler provided by react-markdown.
        code({node, inline, className, children, ...props}) {
            // 1. EXTRACT LANGUAGE
            // Markdown sends the language as a class -> e.g., "language-javascript".
            // This regex checks for the language pattern. If no language is found, `match` is false.
            // If it finds one, `match` becomes true and the language name is stored in match[1].
            const match = /language-(\w+)/.exec(className || '');

            // If the language is "mermaid", don't render it as code — 
            // instead pass the diagramText to our Mermaid component
            // match: Checks if we successfully found a language name.
            if(!inline && match && match[1]==="mermaid"){
                const diagramText = String(children).replace(/\n$/, '');
                return <Mermaid diagramText={diagramText} />
            }

            // 2. DECIDE: BLOCK OR INLINE?
            // (!inline): Checks if it is a big block (```) and not a small inline code (`).
            // match: Checks if we successfully found a language name.
            return !inline && match ? (
                // Instead of a plain <pre> tag, render our custom CodeBlock component!
                <CodeBlock 
                    language={match[1]} // Pass the language we found (e.g., "cpp")
                    // Pass the code content
                    // String(children): ensures it's a string.
                    // .replace(/\n$/, ''): Removes the extra "Enter" (newline) that usually appears at the very end.
                    value={String(children).replace(/\n$/, '')} 
                />
            ) : (
                // --- CASE B: IT IS INLINE CODE ---
                // Example: "Just a `const` variable."
                // We just render a simple styled <code> tag.
                <code className="inline-code" {...props}>
                    {children}
                </code>
            )
        }
    }), [])

    // Function to auto-resize the textarea
    const handleInput = (e) => {
        const target = e.target;
        // Reset height to auto to shrink if text is deleted
        target.style.height = 'auto';
        // Set height to scrollHeight to expand
        target.style.height = `${target.scrollHeight}px`;
    };

    // Handle Enter vs Shift+Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default new line
            handleSubmit(onSubmit)(); // Trigger submit
        }
    };

    // --- TOGGLE MICROPHONE ---
    const handleMicClick = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } 
        else { 
            // We clear the previous transcript so the new sentence starts fresh and doesn't mix with the old one.
            resetTranscript();
            // Start listening continuously
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        }
    };

    const onSubmit = async (data) => {
        // Stop listening if user hits send while mic is on
        if(listening) SpeechRecognition.stopListening();

        // If the user clicks send without typing anything, then simply return
        if (!data.message?.trim()) return;

        // 1. Display the user Message on the chat
        const newMessages = [
            // previous messages + current message
            ...messages, 
            { role: "user", parts:[{text: data.message}] }
        ];
        setMessages(newMessages);
        
        reset(); // 2. Clear input
        resetTranscript(); // Clear the previous speech buffer
        
        // 3. Reset textarea height manually after submit
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // START LOADING
        setIsLoading(true);

        try {
            // 4. Now send this user message to the backend. The backend will forward it to the LLM server,
            //    the server will process the message and return a response to the backend, and the backend
            //    will finally send that response back to us.
            const response = await axiosClient.post("/ai/chat", {
                // We send all previous messages + userMsg to the backend instead of only the new user message because
                // the AI needs context to answer accurately. It must know the entire conversation history to
                // understand what the user is referring to. For example, if we ask “hey, can you improve the
                // above code?”, the model won’t know which code we’re talking about unless we provide the
                // previous messages. Therefore, we always include the full chat history so the AI can respond
                // correctly and maintain continuity.
                // We also send the entire problem data along with the message because the AI doesn’t know which
                // problem the user is currently solving. Without this context, if the user says something like
                // “hey, can you solve this problem?”, the AI wouldn’t know which problem they’re referring to. 
                // So we provide the full problem data to ensure the AI understands the context and can respond 
                // correctly.
                messages:newMessages,
                title:problem.title,
                description:problem.description,
                testCases: problem.visibleTestCases,
                startCode:problem.startCode
            });

            // Display the response we received from the backend in the chat
            const aiMessage = { 
                role: 'model', 
                parts:[{text: response.data.message}], 
            };
            setMessages([...newMessages, aiMessage]);

        } catch (error) {
            console.log("API Error:", error);
            
            // Display the error on the chat
            const errorMessage = { 
                role: 'model', 
                parts:[{text: "Sorry, I encountered an error connecting to the server."}]  
            };
            setMessages([...newMessages, errorMessage]);

        } finally{
            // STOP LOADING (Always runs, success or fail)
            setIsLoading(false);
        }
    };

    // Destructure register to merge refs and onChange handlers
    const { ref: msgRef, onChange: msgOnChange, ...msgRest } = register("message", { required: true });

    return (
        <div className="ai-chat-panel">
            {/* HEADER */}
            <div className="ai-header">
                <div className="ai-identity">
                    <div className="ai-icon-box">
                        <i className="ri-shining-2-fill"></i>
                    </div>
                    <span className="ai-name">Orion</span>
                </div>
                <button className="ai-close-btn" onClick={onClose} title="Close AI">
                    <i className="ri-close-line"></i>
                </button>
            </div>

            {/* CHAT AREA */}
            <div className="ai-messages-area">
                {messages.map((msg, index) => (
                    // Display AI messages on the left and user messages on the right
                    <div key={index} className={`chat-bubble-wrapper ${msg.role === 'user' ? 'chat-right' : 'chat-left'}`}>
                        
                        {msg.role === 'model' && (
                            // Model Icon
                            <div className="chat-avatar model">
                                <i className="ri-shining-2-fill"></i>
                            </div>
                        )}

                        <div className="chat-bubble">
                            <ReactMarkdown
                                // Added remarkPlugins & rehypePlugins
                                remarkPlugins={[remarkMath,remarkGfm]} 
                                rehypePlugins={[rehypeKatex]}

                                // Now our Markdown content will be converted into React elements, allowing us to style them with CSS later,
                                // but we want the code sections to render in our custom style.
                                // So we will explicitly tell ReactMarkdown to render the code part our way...
                                components={markdownComponents}
                            >
                                {msg.parts[0].text}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {/* LOADING INDICATOR UI */}
                {isLoading && (
                    <div className="chat-bubble-wrapper chat-left">
                        {/* Static Avatar */}
                        <div className="chat-avatar model">
                            <i className="ri-shining-2-fill"></i>
                        </div>
                        
                        {/* New Thinking Bubble */}
                        <div className="chat-bubble thinking-bubble-modern">
                            
                            {/* "Orion is thinking" Header */}
                            <div className="thinking-header">
                                <i className="ri-sparkling-fill thinking-icon"></i>
                                <span>Orion is thinking...</span>
                            </div>

                            {/* The Shimmer Lines */}
                            <div className="skeleton-loader">
                                <div className="skeleton-line line-1"></div>
                                <div className="skeleton-line line-2"></div>
                                <div className="skeleton-line line-3"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="ai-input-container">
                <form className="ai-input-area" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-wrapper">
                        <textarea 
                            {...msgRest}
                            ref={(e) => { msgRef(e); textareaRef.current = e; }}
                            placeholder={listening ? "Listening... (Click ✔ to finish)" : "Ask Orion anything..."}
                            autoComplete="off"
                            rows={1}
                            onChange={(e) => { msgOnChange(e); handleInput(e); }}
                            onKeyDown={handleKeyDown}
                            className={listening ? "listening-mode" : ""} // For Conditionally applying CSS
                        />
                        {/* BUTTON GROUP */}
                        <div className="input-actions">

                            {/* CANCEL BUTTON (Visible only when listening) */}
                            {listening && (
                                <button 
                                    type="button" 
                                    className="icon-btn cancel-btn"
                                    onClick={() => {
                                        isCanceling.current = true;

                                        SpeechRecognition.stopListening();
                                        resetTranscript(); // clears the previous speech buffer
                                        reset(); // Clear the Input Text
                                        // Reset the textarea height to 1 row
                                        if (textareaRef.current) {
                                            textareaRef.current.style.height = 'auto';
                                        }
                                        
                                        setTimeout(() => {
                                            isCanceling.current = false;
                                        }, 300);
                                    }}
                                    title="Cancel Recording"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            )}
                            
                            {/* MICROPHONE BUTTON */}
                            {browserSupportsSpeechRecognition && (
                                <button 
                                    type="button" 
                                    className={`icon-btn mic-btn ${listening ? 'active-mic' : ''}`}
                                    onClick={handleMicClick}
                                    title={listening ? "Finish Dictation" : "Start Dictation"}
                                >
                                    {listening ? (
                                        <div className="mic-wave-animation">
                                            {/* SHOW TICK ICON */}
                                            <i className="ri-check-line"></i>
                                        </div>
                                    ) : (
                                        // SHOW MIC ICON
                                        <i className="ri-mic-line"></i>
                                    )}
                                </button>
                            )}

                            {/* SEND BUTTON */}
                            <button type="submit" className="icon-btn send-btn">
                                <i className="ri-send-plane-fill send-icon"></i>
                            </button>
                        </div>
                    </div>
                </form>

                {/* --- NOTE SECTION --- */}
                <div className="ai-footer-note">
                    <i className="ri-information-line"></i>
                    <span>Heads up: Chat history is cleared when you close this panel.</span>
                </div>
            </div>
        </div>
    );
};

export default ChatWithAI;
