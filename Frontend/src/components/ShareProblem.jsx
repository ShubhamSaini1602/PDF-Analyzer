import { useState, useRef, useEffect } from "react";

const ShareProblem = ({ problemTitle }) => {
    // Initially dropdown will be closed
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Handle closing dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get current URL dynamically using -> window.location.href
    const currentUrl = window.location.href;
    const shareText = `Check out this coding problem "${problemTitle}" on ByteRank!`;

    const handleCopyLink = () => {
        // Writing current URL on the clipboard
        navigator.clipboard.writeText(currentUrl);
        alert("Link copied to clipboard!"); 
        setIsOpen(false);
    };

    const handleSocialShare = (platform) => {
        let url = "";
        
        switch(platform) {
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
                break;
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + currentUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
                break;
            default:
                return;
        }
        
        // Open in a new popup window centered on screen
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(url, '_blank', `width=${width},height=${height},top=${top},left=${left}`);
        setIsOpen(false);
    };

    return (
        <div className="share-container" ref={menuRef}>
            {/* The Trigger Button */}
            <button 
                className="share-trigger-btn" 
                title="Share Problem" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="ri-share-forward-line"></i> Share
            </button>

            {/* The Dropdown Menu */}
            {isOpen && (
                <div className="share-dropdown">
                    <div className="share-header">Share via</div>
                    
                    <button className="share-option" onClick={handleCopyLink}>
                        <i className="ri-link"></i>
                        <span>Copy Link</span>
                    </button>
                    
                    <button className="share-option" onClick={() => handleSocialShare('linkedin')}>
                        <i className="ri-linkedin-fill" style={{color: '#0077b5'}}></i>
                        <span>LinkedIn</span>
                    </button>
                    
                    <button className="share-option" onClick={() => handleSocialShare('twitter')}>
                        <i className="ri-twitter-x-fill" style={{color: '#fff'}}></i>
                        <span>Twitter / X</span>
                    </button>
                    
                    <button className="share-option" onClick={() => handleSocialShare('whatsapp')}>
                        <i className="ri-whatsapp-line" style={{color: '#25D366'}}></i>
                        <span>WhatsApp</span>
                    </button>
                    
                    <button className="share-option" onClick={() => handleSocialShare('facebook')}>
                        <i className="ri-facebook-circle-fill" style={{color: '#1877F2'}}></i>
                        <span>Facebook</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareProblem;