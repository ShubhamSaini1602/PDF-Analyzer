import { Link } from 'react-router';
import adminPanelImage from "../assets/admin-PANEL.png";
import notesImage from "../assets/notes-module.png";
import orionImage from "../assets/ORION-AI.png";
import paymentImage from "../assets/secure.png";
import videoSolImage from "../assets/Video-SOL.png";

function Feature4(){
    return (
        <>
        <div className="feature4-main-div">
            <div className="feature4-text-div">
                <h1 className="feature4-heading">Your Complete <span className='developer-text'>Developer</span> Arsenal</h1>
                <div className="feature4-text-div2">
                    <p className="feature4-description">Experience the next evolution of learning. From AI-powered visual debugging to adaptive video solutions, we provide the intelligent ecosystem you need to crack any interview.</p>
                    <Link to="/premium">
                        <button className='plan-btn-mera-2'>See Plans <i className="ri-contract-right-line"></i></button>
                    </Link>
                </div>
            </div>
            {/* CSS GRID */}
            <div className="bento-grid">
                
                {/* Top Left: Orion AI (Spans 2 columns) */}
                <div className="bento-item item-orion">
                    <div className="bento-content">
                        <p className='orion-ka-text'>Orion - AI Visual Debugger</p>
                        <div className='orion-gradient'></div>
                        <img src={orionImage} className='ORION-img'></img>
                    </div>
                </div>

                {/* Top Right: Video Solutions (Spans 1 column) */}
                <div className="bento-item item-video">
                    <div className="bento-content">
                        <p className='video-ka-text'>Video Solutions + Adaptive Bitrate Streaming</p>
                        <div className='video-sol-gradient'></div>
                        <img src={videoSolImage} className='Video-img'></img>
                    </div>
                </div>

                {/* Bottom Left: Notes */}
                <div className="bento-item item-notes">
                    <div className="bento-content">
                        <p className='notes-ka-text'>Personalized Notes</p>
                        <div className='notes-gradient'></div>
                        <img src={notesImage} className='Notes-img'></img>
                    </div>
                </div>

                {/* Bottom Middle: Admin */}
                <div className="bento-item item-admin">
                    <div className="bento-content">
                        <p className='admin-ka-text'>Admin Panel For Colleges</p>
                        <div className='admin-gradient'></div>
                        <img src={adminPanelImage} className='admin-PANEL-img'></img>
                    </div>
                </div>

                {/* Bottom Right: Payments/Support */}
                <div className="bento-item item-secure">
                    <div className="bento-content">
                        <p className='admin-ka-text'>Payments + Premium + Customer Support</p>
                        <div className='payment-gradient'></div>
                        <img src={paymentImage} className='payment-img'></img>
                    </div>
                </div>

            </div>
        </div>
        </>
    )
}

export default Feature4;