import Aurora from "./Aurora";
import { NavLink, Outlet } from "react-router";
import { useDispatch } from "react-redux";
import { logoutUser } from "../CentralStore/authSlice";

function AdminPanel(){
    const dispatch = useDispatch();

    return (
        <>
        <Aurora
            colorStops={["#3730a3", "#86198f", "#155e75"]}
            blend={1}
            amplitude={1}
            speed={0.5}
        />
        <div className="admin-panel">
            <div className="sidebar">
                <img src="/Logo.png" className="panel-logo"></img>
                <p className="panel-text">Admin Panel</p>
                <hr className="sidebar-hr-tag"></hr>
                <p className="sidebar-navigation">Navigation</p>
                <div className="sidebar-btn-group">
                    <NavLink to="." className="sidebar-btn remove-line" end>
                        <button className="sidebar-dashboard-btn"><i className="ri-dashboard-line dashboard-icon2"></i> Dashboard</button>
                    </NavLink>
                    <NavLink to="problemsList" className="sidebar-btn remove-line">
                        <button className="sidebar-problems-btn"><i className="ri-file-list-line problem-icon2"></i> Problems List</button>
                    </NavLink>
                    <NavLink to="createProblem" className="sidebar-btn remove-line">
                        <button className="sidebar-create-problem-btn"><i className="ri-add-line add-icon2"></i> Create Problem</button>
                    </NavLink>
                    <NavLink to="users" className="sidebar-btn remove-line">
                        <button className="sidebar-user-btn"><i className="ri-user-fill user-icon2"></i> Users</button>
                    </NavLink>
                    <NavLink to="videoManagement" className="sidebar-btn remove-line">
                        <button className="sidebar-user-btn"><i className="ri-live-fill video-icon2"></i> Video Management</button>
                    </NavLink>
                    <button className="sidebar-logout-btn" onClick={() => dispatch(logoutUser())}><i className="ri-logout-box-r-line logout-icon2"></i> Logout</button>
                </div>
            </div>
            <div className="main-content">
                {/* Nested Routes will be rendered here according to their paths */}
                <Outlet/>
            </div>
        </div>
        </>
    )
}

export default AdminPanel;