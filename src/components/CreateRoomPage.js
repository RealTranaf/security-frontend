import React, { useState } from 'react'
import { createRoom } from '../services/room-service'

function CreateRoomPage() {
  const [roomName, setRoomName] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [successful, setSuccessful] = useState(false)
  const [loading, setLoading] = useState(false)

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
        // console.log(response)
        setMessage(`Room '${response.data.name}' created successfully`)
        setSuccessful(true)
      } catch (error) {
        const resMessage = (error.response?.data?.message) || error.message || 'An error has occured'
        setMessage(resMessage)
        setSuccessful(false)
        setLoading(false)
        if (error.response && error.response.status === 403) {
          window.location.href = '/login'
        } else {
          console.error('Failed to fetch user:', error)
        }
      }
    } else {
      setLoading(false)
    }
  }

  const onRoomNameChange = (e) => {
    const name = e.target.value
    setRoomName(name)
  }

  return (
    <div className='container d-flex justify-content-center align-items-center'>
      <div className='card card-container'>
        <h3 className='text-center'>Create Room</h3>
        <form onSubmit={handleCreateRoom}>
          {!successful && (
            <div className='container'>
              <div className='mb-3'>
                <label htmlFor='roomName'>Room Name</label>
                <input
                  type='text'
                  className='form-control'
                  name='roomName'
                  value={roomName}
                  onChange={onRoomNameChange}
                />
                {errors.roomName && (
                  <div className='alert alert-danger' role='alert'>
                    {errors.roomName}
                  </div>
                )}
              </div>
              <div className='d-grid mb-3'>
                {loading && (
                  <span className='spinner-border spinner-border-sm me-2'></span>
                )}
                <button className='btn btn-primary'>Create Room</button>
              </div>
            </div>
          )}
        </form>
        {message && <div className='alert alert-info text-center'>{message}</div>}
      </div>
    </div>
  )
}

export default CreateRoomPage