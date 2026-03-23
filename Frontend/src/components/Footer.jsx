import { Link } from 'react-router';
import logoImg from "../assets/Logo.png";

function Footer(){

  	return (
    	<footer className="footer-container">
      		{/* The Main Grid */}
      		<div className="footer-content">
        
        		{/* Column 1: Brand & Socials */}
        		<div className="footer-brand-col">
            		<img src={logoImg} alt="ByteRank Logo" className="footer-logo-img" />
          			<p className="footer-tagline">Empowering the next generation of developers with AI-driven learning and adaptive video solutions.</p>
          			<div className="footer-socials">
            			<a href="https://x.com/Shubham_6175" className="social-link remove-line"><i className="ri-twitter-x-line"></i></a>
            			<a href="https://linkedin.com/in/shubham-saini-23619a274" className="social-link remove-line"><i className="ri-linkedin-fill"></i></a>
            			<a href="#" className="social-link remove-line"><i className="ri-discord-fill"></i></a>
          			</div>
        		</div>

        		{/* Column 2: Product */}
        		<div className="footer-links-col">
          			<h4 className="footer-heading">Product</h4>
          			<ul className="footer-links-list">
            			<li><Link to="/features">Features</Link></li>
            			<li><Link to="/pricing">Pricing</Link></li>
            			<li><Link to="/video-solutions">Video Solutions</Link></li>
            			<li><Link to="/editor">Orion AI Editor</Link></li>
            			<li><Link to="/roadmap">Roadmap</Link></li>
          			</ul>
        		</div>

        		{/* Column 3: Resources */}
        		<div className="footer-links-col">
          			<h4 className="footer-heading">Resources</h4>
          			<ul className="footer-links-list">
            			<li><Link to="/docs">Documentation</Link></li>
            			<li><Link to="/api">API Reference</Link></li>
            			<li><Link to="/community">Community</Link></li>
            			<li><Link to="/blog">Engineering Blog</Link></li>
            			<li><Link to="/help">Help Center</Link></li>
          			</ul>
        		</div>

        		{/* Column 4: Newsletter (The "Premium" Touch) */}
        		<div className="footer-newsletter-col">
          			<h4 className="footer-heading">Stay Updated</h4>
          			<p className="newsletter-desc">Join our newsletter for the latest coding challenges and AI updates.</p>
          			<div className="newsletter-box">
            			<input type="email" placeholder="Enter your email" className="newsletter-input" />
            			<button className="newsletter-btn">
              				<i className="ri-arrow-right-line"></i>
            			</button>
          			</div>
        		</div>
      		</div>

      		{/* The Bottom Bar */}
      		<div className="footer-bottom">
        		<div className="footer-copyright">
          			&copy; {new Date().getFullYear()} ByteRank Inc. All rights reserved.
        		</div>
        		<div className="footer-legal">
          			<Link to="/privacy">Privacy Policy</Link>
          			<Link to="/terms">Terms of Service</Link>
          			<Link to="/cookies">Cookies</Link>
        		</div>
      		</div>
    	</footer>
  	);
};

export default Footer;