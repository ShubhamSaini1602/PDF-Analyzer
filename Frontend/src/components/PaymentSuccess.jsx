import { Link, useLocation} from 'react-router';

function PaymentSuccess(){
    const location = useLocation();
    const { tier_name, payment_id } = location.state || {}

    return (
        <div className="success-page-container">
            {/* --- Background Particles (Confetti) --- */}
            <div className="confetti-wrapper">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={`confetti c-${i}`}></div>
                ))}
            </div>

            <div className="success-card">
                {/* --- Animated Icon Section --- */}
                <div className="success-icon-wrapper">
                    <div className="success-ring ring-1"></div>
                    <div className="success-ring ring-2"></div>
                    <div className="icon-circle">
                        <i className="ri-check-line"></i>
                    </div>
                </div>

                {/* --- Text Content --- */}
                <h1 className="success-title">Payment Successful!</h1>
                <p className="success-subtitle">
                    Welcome to the <span className="highlight-text">Elite Club</span>. 
                    Your coding superpowers are now active.
                </p>

                {/* --- Visual Receipt / Ticket --- */}
                <div className="receipt-box">
                    <div className="receipt-row">
                        <span className="receipt-label">Status</span>
                        <span className="receipt-value active">
                            <i className="ri-checkbox-circle-fill"></i> Active
                        </span>
                    </div>
                    <div className="receipt-row">
                        <span className="receipt-label">Plan</span>
                        <span className="receipt-value text-white">{tier_name}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="receipt-label">Payment ID</span>
                        <span className="receipt-value font-mono">{payment_id}</span>
                    </div>
                    
                    {/* Decorative Dashed Line */}
                    <div className="receipt-divider">
                        <div className="dashed-line"></div>
                    </div>

                    <div className="receipt-footer">
                        <i className="ri-mail-check-line"></i>
                        <span>Receipt sent to your email</span>
                    </div>
                </div>

                {/* --- Action Button --- */}
                <Link to="/problems" className="success-btn-link">
                    <button className="success-cta-btn">
                        <span>Start Coding</span>
                        <i className="ri-arrow-right-line"></i>
                        <div className="btn-shine-effect"></div>
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;



