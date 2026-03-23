import React, { useEffect, useRef, useState, useMemo } from "react";
import mermaid from "mermaid";

// Initialize Mermaid globally with your dark theme preferences
mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,  // Hide Mermaid errors instead of showing them in UI
  theme: "base",

  // Flowchart-specific configuration
  flowchart: {
    curve: 'basis',     // Makes lines curvy and smooth
    padding: 15,        // More space inside nodes
    nodeSpacing: 150,   // More space between nodes
    rankSpacing: 100,    // MORE space between levels
    htmlLabels: true,
  },
  themeVariables: {
    darkMode: true,
    mainBkg: "#e0e7ff",          // Node background color
    nodeBorder: "#8b5cf6",       // Node border (purple)
    lineColor: "#a1a1aa",        // Line/edge color
    primaryTextColor: "#000000", // Node text color (black)
    fontFamily: "Fira Code, monospace",
    fontSize: "18px", 
    clusterBkg: "rgba(255,255,255,0.05)", // Group container background color
    clusterBorder: "#8b5cf6",             // Group container border color
    titleColor: "#e4e4e7" ,                // Section titles color

	// --- XY Chart Colors (The lines in your graph) ---
    // Order: 1st Line (Purple), 2nd Line (Green), 3rd Line (Amber)
    xyPlotColorPalette: "#8b5cf6, #10b981, #f59e0b",   
    // XY Chart Axis/Label Colors
    xyChart: {
        backgroundColor: "transparent",
        titleColor: "#e4e4e7",
        xAxisLabelColor: "#e4e4e7",
        xAxisTitleColor: "#e4e4e7",
        yAxisLabelColor: "#e4e4e7",
        yAxisTitleColor: "#e4e4e7",
        plotColorPalette: "#8b5cf6, #10b981, #f59e0b" // Double-ensure palette is picked up
    }
  },
  securityLevel: "loose",
});

const Mermaid = ({ diagramText }) => {
  	const ref = useRef(null);
  	// For storing our final svg image
  	const [svg, setSvg] = useState("");
  	const [error, setError] = useState(null);

  	// Generate a unique ID for this diagram so multiple diagrams don't clash
	// We regenerate ID only if diagramText changes, preventing unnecessary 
	// cache mismatches.
  	const id = useMemo(() => 
    	`mermaid-${Math.random().toString(36).slice(2, 9)}`
  	, [diagramText]);

  	useEffect(() => {
    	let isMounted = true;

    	// Now we will convert this Markdown-style diagram text into a 
		// professional and beautiful diagram
    	async function textToDiagram() {
      		if (!diagramText) return;

      		try {
        		if (isMounted) setError(null);

				// We can’t fully rely on AI to remove comments, so we’ll strip 
				// out any remaining comments manually and then send this cleaned 
				// text to Mermaid for rendering.
				const cleanText = diagramText.replace(/%%.*/g, "");

        		// Storing our SVG diagram into a svg variable
        		const { svg } = await mermaid.render(id, cleanText);

        		if (isMounted){
          			setSvg(svg);
        		} 
      		} 
      		catch (err) {
        		console.error("Mermaid Render Error:", err);

        		if (isMounted){
        			setError("Failed to render diagram.");
        		}
		
      		}
    	}

    	textToDiagram();

    	// Cleanup Function (Runs on Unmounting)
    	return () => { isMounted = false; };
  	}, [diagramText, id]);

  	// If an error exists, return it immediately and skip the rest of the function
  	if (error) {
    	return (
        	<div className="mermaid-error" style={{ color: '#ef4444', fontSize: '0.8rem', padding: '10px' }}>
            	<i className="ri-error-warning-line"></i> Cannot render diagram
        	</div>
    	);
  	}

  	return (
    	<div 
      		className="mermaid-wrapper"
      		ref={ref}
      		style={{ minHeight: '60px', overflowX: 'auto' }}
      		// Insert the generated SVG HTML diagram directly
      		dangerouslySetInnerHTML={{ __html: svg }}
    	/>
  	);
};

export default React.memo(Mermaid);

