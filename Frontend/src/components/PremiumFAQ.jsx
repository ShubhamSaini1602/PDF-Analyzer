import { useState } from 'react';
import { Link } from "react-router";

const faqs = [
  	{
    	question: "What do I get with a premium subscription?",
    	answer: "With a Premium (Pro Master) subscription, you unlock all advanced features designed to help you prepare seriously for coding interviews and level up faster. You get unlimited access to all problems, in-depth video solutions, and the Orion AI Assistant to help you debug and understand concepts in real time. Premium users can also take AI-powered mock interviews, compare their solutions with optimal approaches, write personal notes, and enjoy faster code execution with advanced debugging tools.",
    	icon: "ri-vip-crown-line",
    	gradient: "from-emerald-500 to-teal-500"
  	},
  	{
    	question: "Is there a student discount available?",
    	answer: "We are currently finalizing a dedicated Student Plan! However, our 'Starter' tier is free, and our prices are already optimized to be affordable for students compared to other platforms.",
    	icon: "ri-graduation-cap-line",
    	gradient: "from-blue-500 to-cyan-500"
  	},
  	{
    	question: "What payment methods are supported?",
    	answer: "We support all major payment methods through Razorpay, including credit and debit cards, UPI, net banking, and popular wallets. This ensures a smooth and secure checkout experience for users across India. All payments are processed securely, and your payment details are never stored on our servers.",
    	icon: "ri-wallet-3-line",
    	gradient: "from-violet-500 to-purple-500"
  	},
  	{
    	question: "What if I subscribe and want to cancel?",
    	answer: "You can cancel your Premium subscription at any time. Once canceled, you’ll continue to have full access to all Premium features until the end of your current billing cycle. After that, your account will automatically move back to the free Starter plan, and you won’t be charged again.",
    	icon: "ri-refund-line",
    	gradient: "from-amber-500 to-orange-500"
  	}
];

function PremiumFAQ() {
    // Add state for the FAQ Accordion
    const [activeIndex, setActiveIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // It handles the logic for opening and closing the FAQ accordions when a user clicks on them.
    // It asks: "Is the question the user just clicked (index) the same one that is currently open (activeIndex)?"
    // 1.) If TRUE --> Closing
    // 2.) If FALSE --> OPENING
    function toggleFAQ(index){
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
      	<div className="premium-faq-section">
        	{/* Background Ambient Glows */}
        	<div className="faq-background-effects">
          		<div className="faq-glow faq-glow-1"></div>
        		<div className="faq-glow faq-glow-2"></div>
        		<div className="faq-glow faq-glow-3"></div>
      		</div>

      		{/* Header */}
      		<div className="faq-header-container">
        		<div className="faq-badge-wrapper">
          			<div className="faq-badge">
            			<i className="ri-question-answer-line"></i>
            			<span>FAQ</span>
            			<div className="badge-shimmer"></div>
          			</div>
        		</div>
        		<h2 className="faq-main-title">Got <span className="title-gradient">Questions?</span></h2>
				<p className="faq-main-subtitle">Everything you need to know about ByteRank Premium</p>

        		<div className="decorative-line">
          			<div className="line-gradient"></div>
        		</div>
      		</div>

      		{/* Grid of Cards */}
      		<div className="faq-grid">
        		{faqs.map((item, index) => (
          			<div
            			key={index}
            			className={`faq-card ${activeIndex === index ? 'faq-active' : ''}`}
            			onMouseEnter={() => setHoveredIndex(index)}
            			onMouseLeave={() => setHoveredIndex(null)}
            			style={{ animationDelay: `${index * 0.1}s` }}
          			>
            			<div className="faq-card-inner" onClick={() => toggleFAQ(index)}>
              				<div className="faq-question-section">
                				{/* Icon Box with Gradient */}
                				<div className="faq-icon-wrapper">
                  					<div className={`faq-icon-bg ${item.gradient}`}>
                    					<i className={item.icon}></i>
                  					</div>
                				</div>

                				<div className="faq-question-content">
                  					<h3 className="faq-question-text">{item.question}</h3>
                				</div>

                				<div className="faq-toggle-btn">
                  					<div className="toggle-btn-inner">
                    					<i className={`ri-${activeIndex === index ? 'subtract' : 'add'}-line`}></i>
                  					</div>
                				</div>
              				</div>

              				{/* Expandable Answer */}
              				<div className={`faq-answer-section ${activeIndex === index ? 'expanded' : ''}`}>
                				<div className="faq-answer-content">
                  					<div className="answer-icon">
                    					<i className="ri-chat-check-line"></i>
                  					</div>
                  					<p className="faq-answer-text">{item.answer}</p>
                				</div>
              				</div>
            			</div>

            			{/* Card Hover Effects */}
            			<div className="card-border-glow"></div>
            			{hoveredIndex === index && (
              				<div className="hover-spotlight"></div>
            			)}
          			</div>
        		))}
      		</div>

      		{/* FAQ Footer */}
      		<div className="faq-footer">
        		<div className="faq-cta-card">
					<img src="/customer-support.png" className='customer-support'></img>
          			<div className='customer-second-div'>
						<div className="cta-icon-group">
            				<i className="ri-customer-service-2-line"></i>
          				</div>
          				<h3 className="cta-title">Still have questions <i className="ri-question-line question-icon"></i></h3>
          				<p className="cta-description">Whether you’re unsure about plans, payments, or premium features, our support team is here to help you every step of the way. Reach out anytime and get quick, friendly assistance — 24/7.</p>
          				<Link to="/contact">
							<button className="cta-contact-btn">
            					<span>Contact Support</span>
            					<i className="ri-arrow-right-line"></i>
            					<div className="btn-shine"></div>
          					</button>
						</Link>
					</div>
        		</div>
      		</div>
    	</div>
  );
}

export default PremiumFAQ;