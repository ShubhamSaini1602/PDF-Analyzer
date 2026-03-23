import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import Aurora from "./Aurora";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

function StartJourney() {
    const navigate = useNavigate();
    
    // Refs for animation
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const cardRef = useRef(null);
    const btnRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();

        // Initial State: Hide Card, Show Loading Text
        gsap.set(cardRef.current, { autoAlpha: 0, scale: 0.8 });
        gsap.set(btnRef.current, { autoAlpha: 0, y: 20 });

        // Animation Sequence
        tl.to(textRef.current, {
            text: "Initializing Environment...",
            duration: 1,
            ease: "none"
        })
        .to(textRef.current, {
            text: "Syncing AI Modules...",
            duration: 1,
            delay: 0.3
        })
        .to(textRef.current, {
            text: "Access Granted.",
            duration: 0.8,
            color: "#4ade80", // Turn green
            delay: 0.2
        })
        .to(textRef.current, {
            autoAlpha: 0, // Fade out text
            duration: 0.5,
            delay: 0.5
        })
        .to(cardRef.current, {
            autoAlpha: 1, // Fade in Card
            scale: 1,
            duration: 1,
            ease: "elastic.out(1, 0.5)"
        })
        .to(btnRef.current, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        }, "-=0.5"); // Overlap slightly with card

    }, []);

    return (
        <div className="journey-container" ref={containerRef}>
            <div className="start-journey-aurora">
                <Aurora
                    colorStops={["#3730a3", "#86198f", "#155e75"]}
                    blend={1}
                    amplitude={1}
                    speed={0.5}
                />
            </div>

            <div className="content-layer">
                {/* Phase 1: The Terminal Text */}
                <h2 className="loading-text" ref={textRef}>System Boot...</h2>

                {/* Phase 2: The Main Card */}
                <div className="journey-card" ref={cardRef}>
                    <h1 className="journey-title">Welcome to <span className="highlight">ByteRank</span></h1>
                    <p className="journey-desc">
                        <i className="ri-check-line start-journey-tick-icon"></i> 100+ Problems. <br />
                        <i className="ri-check-line start-journey-tick-icon"></i> AI-Powered Debugging. <br />
                        <i className="ri-check-line start-journey-tick-icon"></i> Video Solutions. <br />
                        and much MORE...
                    </p>
                    <div className="divider"></div>
                    <p className="journey-sub">Your path to mastery begins now.</p>
                    
                    <button 
                        className="start-btn" 
                        ref={btnRef}
                        onClick={() => navigate("/problems")}
                    >
                        Let's Start <i className="ri-rocket-line"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StartJourney;