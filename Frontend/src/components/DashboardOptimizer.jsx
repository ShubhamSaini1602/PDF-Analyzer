import React, { useState, useEffect } from 'react';

// --- Inline CSS for the component ---
// We define the styles here to encapsulate the component's styling
const DashboardOptimizerStyles = `
  .optimizer-container-dash {
    display: flex;
    justify-content: flex-start; /* Align left */
    align-items: center;
    width: 100%; /* Take full width of parent */
    min-height: 40px; /* Adjust height as needed */
    padding: 0.5rem 0.5rem; /* Reduced padding */
    box-sizing: border-box;
    overflow: hidden; /* Ensure text doesn't overflow if container is small */
  }

  .optimizer-text-dash {
    font-size: 1.25rem; /* Slightly larger for emphasis */
    font-weight: 500;
    color: #f0f0f0; /* Light color for dark background */
    white-space: nowrap; /* Keep text on one line */
    position: relative;
    letter-spacing: 0.02em; /* Slightly more spaced */
    font-family: "Figtree", sans-serif;
  }

  /* --- Typing Cursor Animation --- */
  .cursor-dash {
    font-weight: 300;
    color: #a0a0a0; /* Lighter cursor for contrast */
    animation: blink-dash 1s step-end infinite;
    margin-left: 2px;
  }

  @keyframes blink-dash {
    from, to {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }

  /* --- Shine Animation --- */
  @keyframes shine-animation-dash {
    0% {
      background-position: -200%;
    }
    100% {
      background-position: 200%;
    }
  }

  .optimizer-text-dash.shine {
    background: linear-gradient(
      90deg,
      #f0f0f0 10%, /* Base text color for gradient */
      #7afff6 50%, /* Brighter, more vibrant shine color (teal/cyan) */
      #f0f0f0 90% /* Base text color for gradient */
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent; /* Fallback for browsers without -webkit-text-fill-color */
    animation: shine-animation-dash 1.5s linear infinite;
  }
  
  .optimizer-text-dash.optimizing {
     /* This class just acts as a hook for the .shine class to apply */
  }

  /* Style for the final "Successful" message */
  .optimizer-text-dash.complete {
    color: #66ff99; /* Bright green for success on dark background */
  }
`;


const DashboardOptimizer = () => {
  const [displayText, setDisplayText] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const optimizationMessage = 'Optimization Successful';
  const typingMessage = 'Optimizing Dashboard experience...';

  useEffect(() => {
    // Add the styles to the document head when component mounts
    const styleElement = document.createElement('style');
    styleElement.innerHTML = DashboardOptimizerStyles;
    document.head.appendChild(styleElement);

    // Cleanup function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []); // Run only once on mount to inject styles

  useEffect(() => {
      // Start the animation every time the component mounts
      setIsOptimizing(true);
      setDisplayText(''); // Reset display text
      setIsComplete(false); // Reset complete state
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex <= typingMessage.length) {
          setDisplayText(typingMessage.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // Wait for 1.5s (the shine duration) before marking as complete
          setTimeout(() => {
            setIsOptimizing(false);
            setIsComplete(true);
            setDisplayText(optimizationMessage);
          }, 1500); 
        }
      }, 80); // Typing speed

      return () => clearInterval(typingInterval);
  }, []); // Empty dependency array ensures this runs on every mount

  // Class logic
  const getCssClasses = () => {
    if (isComplete) return 'optimizer-text-dash complete';
    // This will apply the shine effect as soon as optimization starts
    if (isOptimizing) return 'optimizer-text-dash optimizing shine'; 
    return 'optimizer-text-dash';
  };

  return (
    <div className="optimizer-container-dash">
      <h2 className={getCssClasses()}>
        {displayText}
        {/* Show cursor only while typing and not complete */}
        {isOptimizing && !isComplete && <span className="cursor-dash">|</span>}
      </h2>
    </div>
  );
};

export default DashboardOptimizer;