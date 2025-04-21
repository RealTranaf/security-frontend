import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom";

import { logout, getCurrentUser } from '../services/auth-service';
import eventBus from '../services/eventBus';

function NavBar() {
    const [showTeacherBoard, setShowTeacherBoard] = useState(false)
    const [showAdminBoard, setShowAdminBoard] = useState(false)
    const [currentUser, setCurrentUser] = useState()

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getCurrentUser()
            if (user) {
                setCurrentUser(user);
                setShowTeacherBoard(user.role === "TEACHER");
                setShowAdminBoard(user.role === "ADMIN");
            }
        }
        fetchUser()
        eventBus.on("logout", () => {
            logOut()
        })
        return () => {
            eventBus.remove("logout")
        }
    }, []);

    const logOut = () => {
        logout();
        setShowTeacherBoard(false);
        setShowAdminBoard(false);
        setCurrentUser(undefined);
    };

    return (
        <div>
            <nav className='navbar navbar-expand navbar-dark bg-dark'>
                <Link to={"/"} className="navbar-brand" style={{ paddingLeft: "10px" }}>
                    The App
                </Link>
                <div className='navbar-nav me-auto'>

                    <li className="nav-item">
                        <Link to={"/home"} className="nav-link">
                            Home
                        </Link>
                    </li>

                    {showTeacherBoard && (
                        <>
                            <li className="nav-item">
                                <Link to={"/teacher"} className="nav-link">
                                    Teacher Board
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to={"/create-room"} className="nav-link">
                                    Create Room
                                </Link>
                            </li>
                        </>
                    )}

                    {showAdminBoard && (
                        <li className="nav-item">
                            <Link to={"/admin"} className="nav-link">
                                Admin Board
                            </Link>
                        </li>
                    )}

                    {currentUser && (
                        <li className="nav-item">
                            <Link to={"/user"} className="nav-link">
                                User
                            </Link>
                        </li>
                    )}

                </div>
                {currentUser ? (
                    <div className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to={"/profile"} className="nav-link">
                                {currentUser.username}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <a href="/login" className="nav-link" onClick={logOut}>
                                Log out
                            </a>
                        </li>
                    </div>
                ) : (
                    <div className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to={"/login"} className="nav-link">
                                Login
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link to={"/signup"} className="nav-link">
                                Sign Up
                            </Link>
                        </li>
                    </div>
                )}
            </nav>
        </div>
    )
}

export default NavBar