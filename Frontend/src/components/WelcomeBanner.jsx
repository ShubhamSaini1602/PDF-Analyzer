import React from 'react';

// Renamed to WelcomeBanner to match your import
export default function WelcomeBanner() {

  /**
   * We define our animation keyframes here.
   * This string will be injected into a <style> tag.
   * This is the standard way to include @keyframes in
   * a single-file React component without external CSS.
   */
  const keyframes = `
    @keyframes pendulum-swing {
      /* Start position */
      from {
        transform: rotate(22deg);
      }
      /* End position */
      to {
        transform: rotate(-22deg);
      }
    }
  `;

  // --- Removed pageStyle ---
  // The parent component (your dashboard) will control the layout.

  // This style is for the entire swinging mechanism (rope + banner)
  // We apply the animation to this parent container.
  const pendulumContainerStyle = {
    // This positions the banner in the corner of its parent
    position: 'absolute',
    top: '0px', // Hangs below your "Welcome Back" text
    right: '45px', // Inset from the left edge

    // This is crucial: the pivot point is the top-center
    transformOrigin: 'top center',
    // We apply our animation here:
    // name: pendulum-swing
    // duration: 3 seconds
    // timing-function: ease-in-out (slows at the ends)
    // iteration: infinite
    // direction: alternate (swings back and forth)
    animation: 'pendulum-swing 3s ease-in-out infinite alternate',
    // We set a width for the whole swinging part
    width: '300px',
  };

  // --- Removed ropeHolderStyle ---

  // Base style for the ropes
  const baseRopeStyle = {
    width: '3px',
    backgroundColor: '#c2a679',
    borderRadius: '2px',
    position: 'absolute',
    top: 0,
    left: '50%', // Start at center
    transformOrigin: 'top center',
  };

  // We want the ropes to attach 20px in from the 300px container edge
  // This is where the old `ropeHolderStyle` padding was.
  // Attachment points at 20px and 280px.
  // Center is 150px. Horizontal distance from center = 150 - 20 = 130px.
  // Vertical height of rope = 150px.
  const hDist = 130; // 130px horizontal
  const vDist = 150; // 150px vertical

  // Actual rope length (hypotenuse)
  // sqrt(130^2 + 150^2) = ~198.5px
  const ropeLength = Math.sqrt(Math.pow(hDist, 2) + Math.pow(vDist, 2));
  
  // Angle of the rope
  // asin(130 / 198.5) = ~40.9 deg
  const ropeAngle = Math.asin(hDist / ropeLength) * (180 / Math.PI);

  const leftRopeStyle = {
    ...baseRopeStyle,
    height: `${ropeLength}px`,
    // We also need to shift it half a pixel left to center the 3px line
    transform: `rotate(-${ropeAngle}deg) translateX(-1.5px)`, 
  };
  
  const rightRopeStyle = {
    ...baseRopeStyle,
    height: `${ropeLength}px`,
    // We also need to shift it half a pixel left to center the 3px line
    transform: `rotate(${ropeAngle}deg) translateX(-1.5px)`,
  };

  // New style for the container holding the two ropes
  const vRopeContainerStyle = {
    position: 'relative',
    height: `${vDist}px`, // This is the vertical height
    width: '100%',
  };

  // --- Removed old ropeStyle ---

  // Styles for the banner itself
  const bannerStyle = {
    padding: '24px 48px',
    backgroundColor: '#dc2626', // A vibrant, "logout button" red
    color: 'white',
    fontSize: '2.5rem', // Large, readable text
    fontWeight: 'bold',
    borderRadius: '12px',
    textAlign: 'center',
    // A beautiful shadow to make it "pop"
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '4px solid #ffffff', // A clean white border
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)', // Subtle shadow on the text
    width: '100%', // Make banner fill the container width
    boxSizing: 'border-box', // Include padding in the width calculation
  };

  return (
    // We use a Fragment here since we don't need the page-wrapper div
    <>
      {/* Inject the <style> tag with our keyframes.
        This makes the 'pendulum-swing' animation available
        to our component.
      */}
      <style>{keyframes}</style>

      {/* This is the container that swings */}
      <div style={pendulumContainerStyle}>
        {/* Container for the two V-ropes */}
        <div style={vRopeContainerStyle}>
          <div style={leftRopeStyle}></div>
          <div style={rightRopeStyle}></div>
        </div>
        
        {/* The banner */}
        <div style={bannerStyle}>
          Welcome!
        </div>
      </div>
    </>
  );
}