import React, { useState } from 'react'
import { createRoom } from '../services/room-service'

function CreateRoomModal({ show, onClose, onSuccess }) {
    const [roomName, setRoomName] = useState('')
    const [type, setType] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreateRoom = async () => {
        setError('')
        if (!roomName.trim() || !type) {
            setError('Please enter a room name and select a class type.')
            return
        }
        setLoading(true)
        try {
            await createRoom( roomName, type )
            setRoomName('')
            setType('')
            onSuccess && onSuccess()
            onClose()
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                'Failed to create room'
            )
            setLoading(false)
        }
    }
        if (!show) {
            return null
        }

        return (
            <div className='modal show d-block' tabIndex={-1} style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className='modal-dialog '>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Create Room</h5>
                            <button type='button' className='btn-close' onClick={onClose}></button>
                        </div>
                        <div className='modal-body'>
                            <div className='mb-3'>
                                <div className='mb-3'>
                                    <label className='form-label fw-semibold'>Room Name</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        value={roomName}
                                        onChange={e => setRoomName(e.target.value)}
                                        placeholder='Enter room name'
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label fw-semibold'>Class Type</label>
                                    <select
                                        className='form-select'
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        <option value=''>Select class type</option>
                                        <option value='CLASS_1'>Đồ án 1</option>
                                        <option value='CLASS_2'>Đồ án 2</option>
                                        <option value='CLASS_3'>Đồ án 3</option>
                                        <option value='CLASS_F'>Đồ án tốt nghiệp</option>
                                    </select>
                                </div>
                                {error && (
                                    <div className='alert alert-danger mt-2' role='alert'>
                                        {error}
                                    </div>
                                )}
                            </div>
                            <div className='modal-footer'>
                                <button
                                    className='btn btn-primary'
                                    onClick={handleCreateRoom}
                                    disabled={loading}
                                >
                                    {loading && <span className='spinner-border spinner-border-sm me-2'></span>}
                                    Create Room
                                </button>
                                <button type='button' className='btn btn-secondary' onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    export default CreateRoomModal