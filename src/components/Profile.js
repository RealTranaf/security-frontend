import React from "react";
import { getUser } from "../services/user-service";

function Profile() {

    const currentUser = getUser();
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
                        <strong>Token:</strong>{" "}
                        {currentUser.accessToken.substring(0, 20)}...
                        {currentUser.accessToken.substr(currentUser.accessToken.length - 20)}
                    </p>
                    <p className="mb-2">
                        <strong>Id:</strong> {currentUser.id}
                    </p>
                    <p className="mb-2">
                        <strong>Email:</strong> {currentUser.email}
                    </p>
                    <strong>Authorities:</strong>
                    <ul>
                        {currentUser.roles &&
                            currentUser.roles.map((role, index) => <li key={index}>{role}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Profile