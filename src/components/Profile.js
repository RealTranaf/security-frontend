import React from "react";
import { getCurrentUser } from "../services/auth-service";

function Profile() {
    
    const currentUser = getCurrentUser();
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
                        <strong>JWT:</strong> {currentUser.token}
                    </p>
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