import React, { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/user-service'
import { getRoomList } from '../services/room-service'
import CreateRoomModal from './CreateRoomModal'
import { useNavigate } from 'react-router-dom'
import backgroundImg from '../resource/bkhn-2.jpg'

function Home() {
    const [rooms, setRooms] = useState([])
    const [error, setError] = useState('')
    const [currentUser, setCurrentUser] = useState()
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [filteredRooms, setFilteredRooms] = useState([])

    const navigate = useNavigate()

    const fetchRoom = async () => {
        try {
            const response = await getRoomList()
            const sortedRooms = response.data.sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            setRooms(sortedRooms)
            setFilteredRooms(sortedRooms)
        } catch (error) {
            const errorMessage =
                (error.response && error.response.data) ||
                error.message ||
                error.toString()

            setError(errorMessage)
            if (error.response && error.response.status === 403) {
                window.location.href = '/login'
            } else {
                console.error('Failed to fetch user:', error)
            }
        }
    }
    const fetchUser = async () => {
        try {
            const response = await getCurrentUser()
            const user = response.data
            if (user) {
                setCurrentUser(user)
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                window.location.href = '/login'
            } else {
                console.error('Failed to fetch user:', error)
            }
        }
    }

    useEffect(() => {
        fetchRoom()
        fetchUser()
    }, [])

    useEffect(() => {
        const lower = search.trim().toLowerCase()
        setFilteredRooms(
            rooms.filter(room => {
                const matchesName = room.name && room.name.toLowerCase().includes(lower)
                const matchesType = !typeFilter || (room.type && room.type === typeFilter)
                return matchesName && matchesType
            })
        )
    }, [search, typeFilter, rooms])

    const handleRoomClick = (roomId) => {
        navigate(`/rooms/${roomId}`)
    }

    return (
        <div className='min-vh-100 position-relative security-bg'>
            <div
                className='bg-overlay'
                style={{ backgroundImage: `url(${backgroundImg})` }}
            >
            </div>
            <div className='container mt-5 position-relative' style={{ zIndex: 1 }}>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h3 className='fw-bold mb-0'>Your classes</h3>
                    {currentUser && currentUser.role === 'TEACHER' && (
                        <button className='btn btn-primary' onClick={() => setShowCreateModal(true)}>
                            <i className='bi bi-plus-circle me-1'></i>
                            Create Room
                        </button>
                    )}
                </div>
                <div className='mb-3 row'>
                    <div className='col-md-8 mb-2 mb-md-0'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Search by name...'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className='col-md-4'>
                        <select
                            className='form-select'
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >  
                            <option key={''} value={''}>All type</option>
                            <option key={'Đồ án 1'} value={'Đồ án 1'}>Đồ án 1</option>
                            <option key={'Đồ án 2'} value={'Đồ án 2'}>Đồ án 2</option>
                            <option key={'Đồ án 3'} value={'Đồ án 3'}>Đồ án 3</option>
                            <option key={'Đồ án tốt nghiệp'} value={'Đồ án tốt nghiệp'}>Đồ án tốt nghiệp</option>

                        </select>
                    </div>
                </div>
                {error && <div className='alert alert-danger'>{error}</div>}
                <div className='row g-4'>
                    {filteredRooms.length === 0 ? (
                        <div className='col-12 text-center text-muted'>
                            <i className='bi bi-door-closed fs-1 mb-2' style={{ color: 'var(--main-red)' }}></i>
                            <div>No classes found</div>
                        </div>
                    ) : (
                        filteredRooms.map((room) => (
                            <div className='col-12 col-sm-6 col-md-4 col-lg-3 d-flex' key={room.id}>
                                <div
                                    className='card shadow-sm room-card-hover flex-fill'
                                    style={{
                                        cursor: 'pointer',
                                        border: '1.5px solid #e0e0e0',
                                        borderRadius: '18px',
                                        transition: 'transform 0.15s, box-shadow 0.15s',
                                        minWidth: 0,
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                                    }}
                                    onClick={() => handleRoomClick(room.id)}
                                >
                                    <div className='card-body d-flex flex-column align-item-center justify-content-between' style={{ minHeight: 140 }}>
                                        <div className='w-100 text-center'>
                                            <i className='bi bi-door-open fs-2 mb-2 text-primary'></i>
                                            <h5 className='card-title fw-semibold mb-2 text-truncate'>
                                                {room.name}
                                            </h5>
                                            <p className='card-text mb-1 text-muted'>
                                                Created by: <span className='fw-semibold'>{room.createdBy}</span>
                                            </p>
                                            <p className='card-text mb-0'>
                                                <span className='badge' style={{ background: 'var(--main-red)' }}>
                                                    {room.type}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <CreateRoomModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchRoom}
                >
                </CreateRoomModal>
            </div>
        </div>
    )
}

export default Home