import React, { useEffect, useState } from 'react'
// import { getPublicHello } from '../services/user-service'
import { getRoomList } from '../services/room-service'
import { useNavigate } from 'react-router-dom'

function Home() {
    const [rooms, setRooms] = useState([])
    const [error, setError] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await getRoomList()

                const sortedRooms = response.data.sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
                setRooms(sortedRooms)
            } catch (error) {
                const errorMessage =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString()

                setError(errorMessage)
                if (error.response && error.response.status === 403) {
                    window.location.href = "/login"
                } else {
                    console.error("Failed to fetch user:", error)
                }
            }
        }
        fetchRoom()
    }, [])

    const handleRoomClick = (roomId) => {
        navigate(`/rooms/${roomId}`)
    }

    return (
        <div className="container">
            <div className="p-5 rounded">
                <h3>Your classes</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr)" }}>
                    {rooms.map((room) => (
                        <div className="col-md-6" key={room.id}>
                            <div
                                className="room-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleRoomClick(room.id)}
                            >
                                <div className="card-body">
                                    <h5 className="room-card-title">{room.name}</h5>
                                    <p className="room-card-text">
                                        Created by: {room.createdBy}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home