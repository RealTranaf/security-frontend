import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRoomDetail, addUserstoRoom } from '../services/room-service'
import { getCurrentUser } from '../services/user-service'

import '../App.css'

function RoomPage() {
    const { roomId } = useParams()
    const [room, setRoom] = useState(null)
    const [error, setError] = useState('')

    const [usernames, setUsernames] = useState('')
    const [message, setMessage] = useState('')
    const [showModal, setShowModal] = useState(false)

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

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await getRoomDetail(roomId)
                setRoom(response.data)
            } catch (error) {
                const errorMessage =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString()

                setError(errorMessage);
            }
        }

        fetchRoomDetails()
    }, [roomId])

    const handleAddUsers = async (e) => {
        e.preventDefault()
        setMessage('')
        const usernamesArray = usernames.split(',').map((name) => name.trim())
        try {
            await addUserstoRoom(roomId, usernamesArray);
            setMessage('Users added successfully')
            setUsernames('')
            setShowModal(false)
        } catch (error) {
            const errorMessage =
                (error.response && error.response.data) ||
                error.message ||
                error.toString()

            setError(errorMessage);
        }
    }

    const onUsernamesChange = (e) => {
        setUsernames(e.target.value)
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!room) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center">
                <h3>{room.name}</h3>
                {(currentUser.role === "TEACHER" || currentUser.role === "ADMIN") && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            // setShowModal(true)
                            console.log(showModal)
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#addUsersModal"
                    >
                        Add Users
                    </button>
                )}

            </div>
            <p>Room ID: {room.id}</p>
            <p>Room Creator: {room.createdBy}</p>
            <h5>Users in this room:</h5>
            <ul>
                {room.userList.map((user, index) => (
                    <li key={index}>{user}</li>
                ))}
            </ul>

            {/* Modal */}
            <div
                className="modal fade"
                id="addUsersModal"
                tabIndex="-1"
                aria-labelledby="addUsersModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addUsersModalLabel">
                                Add Users to this Room
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="usernames" className="form-label">
                                    Usernames (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="usernames"
                                    value={usernames}
                                    onChange={onUsernamesChange}
                                    required
                                />
                            </div>
                            {message && (
                                <div className="alert alert-info mt-3">{message}</div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddUsers}
                            >
                                Add Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomPage