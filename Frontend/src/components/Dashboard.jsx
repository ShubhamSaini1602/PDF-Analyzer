import { useSelector } from "react-redux";
import WelcomeBanner from "./WelcomeBanner";
import DashboardOptimizer from "./DashboardOptimizer";
import axiosClient from "../utils/axiosClient";
import { useEffect, useState } from "react";
import Carousel from "./Carousel";
import adminOptimize from "../assets/admin.png"
import trendImg from "../assets/trend.png";

function Dashboard(){
    const userInfo = useSelector((state) => state.auth.user);

    if(!userInfo){
        return null;
    }

    // Extracting full name of the user
    const firstName = userInfo.firstName;
    const lastName = userInfo.lastName;
    const fullName = `${firstName} ${lastName}`;

    const [allProblems, setAllProblems] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    async function fetchData(){
        const response1 = await axiosClient.get("/problem/getAllProblems");
        const data1 = response1.data;
        setAllProblems(data1);

        const response2 = await axiosClient.get("/user/getAllUsers");
        const data2 = response2.data;
        setAllUsers(data2);
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
        <div className="dashboard-main-div">
            <p className="welcome-admin">{`Welcome Back, ${fullName} !`}</p>
            <WelcomeBanner/>
            <p className="dashboard-TEXT">Your coding platform is thriving. Create, edit and manage problems to help developers sharpen their skills.</p>
            <div className="image-div">
                <img src={adminOptimize} className="admin-pic2"></img>
                <div className="extra-positioning-div">
                    <DashboardOptimizer/>
                </div>
            </div>
        </div>
        <div className="dashboard-cards-container">
            <div className="card1">
                <i className="ri-file-list-3-line all-problems-icon"></i>
                <p className="card-txt">Total Problems</p>
                <p className="count-of-problems">{allProblems.length}</p>
                <button className="active-btn">Active</button>
            </div>
            <div className="card2">
                <i className="ri-team-line total-users-icon"></i>
                <p className="card-txt">Total Users</p>
                <p className="count-of-users">{allUsers.length}</p>
                <button className="active-btn">Active</button>
            </div>
        </div>
        <div className="dashboard-carousel">
            <div className="platform-insights-div">
                <img src={trendImg} className="trend-img"></img>
                <h2 className="insights">Platform Insights</h2>
            </div>
            <div style={{position: 'relative' }}>
                <Carousel
                    baseWidth={1000}
                    autoplay={true}
                    autoplayDelay={5000}
                    loop={true}
                    round={false}
                />
            </div>
        </div>
        </>
    )
}
export default Dashboard;