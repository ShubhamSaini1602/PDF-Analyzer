import Aurora from "./Aurora";
import RotatingText from "./RotatingText";
import TypingAnimation from "./TypingAnimation";
import { Link } from "react-router";
import ProfileMenu from "./ProfileMenu";
import { useSelector } from "react-redux";
import codingTagImg from "../assets/coding-tag.png";
import LogoImg from "../assets/Logo.png";

function Header(){
    const { user } = useSelector((state) => state.auth);

    return (
        <>
        <Aurora
            colorStops={["#3730a3", "#86198f", "#155e75"]}
            blend={1}
            amplitude={1}
            speed={0.5}
        />
        <div className="header">
            <div className="navbar">
                <img src={LogoImg} className="logo"></img>
                <div className="navbar-2">
                    <div className="div1 extra-div-1">
                        <i className="ri-home-7-fill home-icon"></i>
                        <button className="btn">Home</button>
                    </div>
                    <div className="div1">
                        <i className="ri-code-box-fill problem-icon"></i>
                        <Link to="/problems">
                            <button className="btn">Problems</button>
                        </Link>
                    </div>
                    <div className="div1 extra-div-2">
                        <i className="ri-phone-fill call-icon"></i>
                        <Link to="/contact">
                            <button className="btn">Contact Us</button>
                        </Link>
                    </div>
                </div>
                <div className="profile-menu-div">
                    {user?.role==="admin" ? (
                        <Link to="/adminPanel">
                            <button className="admin-btn">Admin Panel</button>
                        </Link>
                    ) : (
                        <ProfileMenu/>
                    )}
                </div>
                <Link to="/premium">
                    <button className="premium-features">Premium</button>
                </Link>
            </div>
            {/* ------------------------- */}
            <div className="main-container">
                <div className="container-1">
                    <div className="headline">
                        <h1 className="headline-1">Master <span className="dsa">DSA</span></h1>
                        <h2 className="headline-2">Crack Every Interview</h2>
                        <div className="headline-3-div">
                            <h1 className="headline-3">Code with</h1>
                            <div className="rotating-text-wrapper">
                                <RotatingText
                                    texts={["Logic", "Consistency", "Confidence"]}
                                    mainClassName="my-rotating-text-container"
                                    splitLevelClassName="my-word-wrapper"
                                    staggerFrom={"last"}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "-120%" }}
                                    staggerDuration={0.025}
                                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                    rotationInterval={2000}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="subheading">
                        <p className="subheading-1">ByteRank is your all-in-one coding arena designed to sharpen your logic, strengthen your problem-solving skills, and prepare you for the toughest technical interviews.</p>
                        <p className="subheading-2">Learn, compete, and rise through the ranks — one byte at a time.</p>
                    </div>

                    <div className="main-btn">
                        <Link to="/start-journey">
                            <button className="start">Start Your Journey</button>
                        </Link>
                        <div className="logo-btn">
                            <img src={codingTagImg} className="coding-tag"></img>
                            <button className="try-problem">Try a Sample Problem</button>
                        </div>
                    </div>
                </div>
                <div className="container-2">
                    <TypingAnimation/>
                </div>
            </div>
            <hr className="header-hr-tag"></hr>
        </div>

        </>
    )
}

export default Header;