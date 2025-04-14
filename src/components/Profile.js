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
                    
                    {/* <p className="mb-2">
                        <strong>Tokens:</strong>
                        <ul className="mt-2">
                            {currentUser.token.map((token, index) => (
                                <li key={index}>
                                    {token.substring(0, 20)}...{token.substring(token.length - 20)}
                                </li>
                            ))}
                        </ul>
                    </p> */}
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