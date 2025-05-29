import React, { useState, useRef, useEffect } from 'react'
import { createRoom } from '../services/room-service'

function CreateRoomModal({ show, onClose, onSuccess }) {
    const [roomName, setRoomName] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [successful, setSuccessful] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        if (show) {
            setRoomName('')
            setMessage('')
            setErrors({})
            setSuccessful(false)
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus()
                }
            }, 200)
        }
    }, [show])

    const validateForm = () => {
        const errors = {}
        if (!roomName) {
            errors.roomName = 'Please enter a name for the room.'
        }
        else if (roomName.length < 3 || roomName.length > 30) {
            errors.roomName = 'The room name must be between 3 to 30 characters'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleCreateRoom = async (e) => {
        e.preventDefault()
        setMessage('')
        setSuccessful(false)
        setLoading(true)

        if (validateForm()) {
            try {
                const response = await createRoom(roomName)
                setMessage(`Room '${response.data.name}' created successfully`)
                setSuccessful(true)
                setRoomName('')
                setTimeout(() => {
                    setMessage('')
                    setSuccessful(false)
                    setLoading(false)
                    onClose()
                    if (onSuccess) onSuccess()
                }, 1200)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error has occured'
                setMessage(resMessage)
                setSuccessful(false)
                setLoading(false)
                console.error('Failed to fetch user:', error)
            }
        } else {
            setLoading(false)
        }
    }

    const onRoomNameChange = (e) => {
        setRoomName(e.target.value)
    }

    if (!show) {
        return null
    }

    return (
        <div className='modal fade show' tabIndex={-1} style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
            <div className='modal-dialog modal-dialog-centered'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>Create Room</h5>
                        <button type='button' className='btn-close' onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleCreateRoom}>
                        <div className='modal-body'>
                            {!successful && (
                                <>
                                    <div className='mb-3'>
                                        <div className='mb-3'>
                                            <label htmlFor='roomName' className='form-label'>Room Name</label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                name='roomName'
                                                id='roomName'
                                                value={roomName}
                                                onChange={onRoomNameChange}
                                                ref={inputRef}
                                            />
                                            {errors.roomName && (
                                                <div className='alert alert-danger mt-2' role='alert'>
                                                    {errors.roomName}
                                                </div>
                                            )}
                                        </div>
                                        <div className='d-grid mb-3'>
                                            {loading && (
                                                <span className='spinner-border spinner-border-sm me-2'></span>
                                            )}
                                            <button className='btn btn-primary' type='submit' disabled={loading}>
                                                Create Room
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {message && <div className={`alert ${successful ? 'alert-success' : 'alert-info'} text-center`}>{message}</div>}
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateRoomModal