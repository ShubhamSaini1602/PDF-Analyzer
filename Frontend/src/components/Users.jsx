import axiosClient from "../utils/axiosClient";
import { useEffect, useState } from "react";

function Users(){
    const [allUsers, setAllUsers] = useState([]);
    const [searchUser, setSearchUser] = useState("");
    const [roleValue, setRoleValue] = useState("All Roles");

    async function fetchUsers(){
        const response = await axiosClient.get("/user/getAllUsers");
        const data = response.data;
        setAllUsers(data);
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = allUsers.filter((user) => {
        const matchesSearch = searchUser==="" || (user.firstName.toLowerCase().includes(searchUser.toLowerCase()));
        const matchesRole = roleValue==="All Roles" || (user.role===roleValue);

        // The user is kept ONLY if both conditions are true
        return matchesSearch && matchesRole;
    })

    return (
        <>
        <div className="user-management-div">
            <img src="/user-management-icon.png" className="user-management-icon"></img>
            <h1 className="user-management-text">User Management</h1>
        </div>
        <p className="user-management-extra-text">View and manage all users on your platform</p>

        <div className="users-container">
            <div className="user-filter">
                <div className="search-user">
                    <i className="ri-search-line search-icon2"></i>
                    <input type="text" className="user-input" name="user-search" placeholder="Search User..." value={searchUser} onChange={(event) => setSearchUser(event.target.value)}></input>
                </div>
                <div className="role-filter">
                    <i className="ri-shield-user-line role-icon"></i>
                    <select className="role-dropdown" name="role" value={roleValue} onChange={(event) => setRoleValue(event.target.value)}>
                        <option value="All Roles">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* User List */}
            <div className="user-list">
                {
                    filteredUsers.map((user) => (
                        <div className="user-div">
                            <div className="starter-div">
                                <div className="initials-DIV">
                                    <p className="first-last-name-initials">{(user.firstName[0] + user.lastName[0]).toUpperCase()}</p>
                                </div>
                                <div className="main-user-info">
                                    <p className="user-name">{`${user.firstName} ${user.lastName}`}</p>
                                    <div className="user-email-div">
                                        <i className="ri-mail-line email-icon"></i>
                                        <p className="user-email">{user.emailId}</p>
                                    </div>
                                </div>
                            </div>
                            <hr className="user-div-hr-tag"></hr>
                            <div className="extra-user-info">
                                <div className="user-joining-date">
                                    <p className="joined">Joined</p>
                                    <p className="date">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="problems-solved-div">
                                    <p className="problems-solved-text">Problems Solved</p>
                                    <p className="problems-solved-count">{user.problemsSolved.length}</p>
                                </div>
                            </div>
                            <div className={`role-div ${user.role==="user" ? "blue-role" : "red-role"}`}>
                                <p className={`role-text ${user.role==="user" ? "blue-role-txt" : "red-role-txt"}`}>{user.role}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
        </>
    )
}

export default Users;