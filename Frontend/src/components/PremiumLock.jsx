import { Link } from 'react-router';

function PremiumLock({ title}){

    return (
        <div className="premium-lock-overlay">
            {/* The Lock Message Card */}
            <div className="lock-content">
                <div className="lock-icon-box">
                    <i className="ri-lock-2-fill"></i>
                </div>
                
                <h3>{title} is Locked</h3>
                <p>Upgrade to Pro Master to unlock detailed video solutions, AI debugging, and more.</p>
                
                <Link to="/premium" className='remove-line'>
                    <button className="unlock-btn">
                        <i className="ri-flashlight-fill"></i>
                        Unlock Now
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default PremiumLock;