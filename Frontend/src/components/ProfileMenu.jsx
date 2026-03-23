import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../CentralStore/authSlice";

function ProfileMenu(){
    const userInfo = useSelector((state) => state.auth.user);

    // If the JWT token expires, the user will be logged out automatically and the user information 
    // received from the server will be cleared. As a result, the variable `userInfo` becomes null.  
    // Now, if we don’t handle this case properly and allow the code below to execute, it will still 
    // try to access `userInfo.firstName` or `userInfo.lastName`, which no longer exist since 
    // `userInfo` itself is null — causing the entire app to crash.  
    // To prevent this, we return `null` early when `userInfo` is null so that the rest of the 
    // component’s code doesn’t run and the app remains stable.
    if(!userInfo){
        return null;
    }
    
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

    // Extracting initials of name --->
    const fInitial = userInfo.firstName[0];
    // Since, in the GitHub login logic, we set "lastName" as an empty string, we need a fallback value
    const lInitial = userInfo.lastName[0] || "";
    const initials = (fInitial + lInitial).toUpperCase();

    // Extracting the full name of User --->
    const firstName = userInfo.firstName;
    // Since, in the GitHub login logic, we set "lastName" as an empty string, we need a fallback value
    const lastName = userInfo.lastName || "";
    // We’re writing it this way to ensure there’s a space between the first 
    // and last names when displayed
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    // Extract Profile Picture from the userInfo object
    const profilePic = userInfo.profilePicture;

    return (
        <>
        {/* To create this profile menu, we'll first build the complete structure — 
        the ProfileBtn along with the ProfileDropDown. Initially, the ProfileDropDown's 
        opacity will be set to 0 to keep it hidden. When the user clicks the ProfileBtn, 
        we'll make it visible by changing its opacity to 1. This functionality will be
        achieved by using a useState variable isOpen */}
        <div className="profile-menu-container">
            {/* ProfileBtn */}
            <button className="profile-btn" onClick={() => setIsOpen(!isOpen)}>
                {profilePic ? (
                    <img src={profilePic} className="profile-pic" alt="Profile"></img>
                ) : (
                    <div className="short-name-div">
                        <p className="short-name">{initials}</p>
                    </div>
                )}
                <p className="full-name">{fullName}</p>
            </button>
            {/* ProfileDropDown */}
            <div className={`profile-dropdown ${isOpen ? "open" : ""}`}>
                <p className="welcome">Welcome back, <span className="fullName">{fullName}</span></p>
                <div className="trophy-msg">
                    <i className="ri-trophy-line trophy-icon"></i>
                    <p className="trophy-txt">Keep crushing those problems!</p>
                </div>
                <hr className="dropdown-hr-tag"></hr>
                <div className="btN-container">
                    <button className="dashboard-btn">
                        <i className="ri-dashboard-line dashboard-icon"></i>
                        <p className="dashboard-btn-txt">Dashboard</p>
                    </button>
                    <button className="logout-btn" onClick={() => dispatch(logoutUser())}>
                        <i className="ri-logout-box-r-line logout-icon"></i>
                        <p className="logout-btn-txt">Logout</p>
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}

export default ProfileMenu;