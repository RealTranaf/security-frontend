import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../services/user-service";

function Profile() {
    const [currentUser, setCurrentUser] = useState()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser()
                const user = response.data
                console.log(user)
                if (user) {
                    setCurrentUser(user)
                }
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    window.location.href = "/login"
                } else {
                    console.error("Failed to fetch user:", error)
                }
            }
        }
        fetchUser()
    }, [])

    if (!currentUser) {
        return <div>Loading...</div>; // Show a loading message while fetching user data
    }

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">
                        <strong>{currentUser.username}</strong> Profile
                    </h3>
                </div>
                <div className="card-body">
                    <p className="mb-2">
                        <strong>Username:</strong> {currentUser.username}
                    </p>
                    <p className="mb-2">
                        <strong>Email:</strong> {currentUser.email}
                    </p>
                    <p className="mb-2">
                        <strong>Authorities:</strong> {currentUser.role}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Profile