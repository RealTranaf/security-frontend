import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRoomDetail, addUserstoRoom, removeUsersFromRoom } from '../services/room-service'
import { getCurrentUser, searchUsers } from '../services/user-service'
import { getPostsByRoom, createPost } from '../services/post-service'

import '../App.css'

function RoomPage() {
    const { roomId } = useParams()
    const [room, setRoom] = useState(null)
    const [error, setError] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const [selectedUsersAdd, setSelectedUsersAdd] = useState([])
    const [selectedUsersRemove, setSelectedUsersRemove] = useState([])

    const [posts, setPosts] = useState([])
    const [newPostContent, setNewPostContent] = useState('')
    const [newCommentContent, setNewCommentContent] = useState({})

    const [isLoadingUser, setIsLoadingUser] = useState(true)
    // const [message, setMessage] = useState('')

    const [currentUser, setCurrentUser] = useState()

    //get current user
    useEffect(() => {
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
            } finally {
                setIsLoadingUser(false)
            }
        }
        fetchUser()
    }, [])

    //get room details
    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await getRoomDetail(roomId)
                // console.log(response.data)
                setRoom(response.data)
                // console.log(response)
            } catch (error) {
                const errorMessage =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString()

                setError(errorMessage);
            }
        }

        const fetchPosts = async () => {
            try{
                const response = await getPostsByRoom(roomId)
                setPosts(response.data)
            } catch(error){
                console.error('Failed to fetch posts:', error)
            }
        }

        fetchRoomDetails()
        fetchPosts()
    }, [roomId])

    //user search function
    useEffect(() => {
        const search = async () => {
            if (searchQuery.length >= 3) {
                try {
                    const response = await searchUsers(searchQuery)
                    const filteredResults = response.data.filter(
                        (user) => !room.userList.some((roomUser) => roomUser.username === user.username)
                    )

                    setSearchResults(filteredResults)
                } catch (error) {
                    console.error('Failed to search users:', error)
                }
            } else {
                setSearchResults([])
            }
        }
        search()
    }, [searchQuery])

    const handleAddPost = async () => {
        if (!newPostContent.trim){
            return
        }
        try {
            const response = await createPost()
        }
    }

    //handle adding users
    const handleAddUsers = async (e) => {
        e.preventDefault()
        // setMessage('')
        try {
            const usernamesArray = selectedUsersAdd.map((user) => user.username)
            await addUserstoRoom(roomId, usernamesArray)
            // setMessage('Users added successfully')

            const response = await getRoomDetail(roomId)
            setRoom(response.data)

            setSelectedUsersAdd([])
            setSearchQuery('')
            setSearchResults([])
        } catch (error) {
            const errorMessage =
                (error.response && error.response.data) ||
                error.message ||
                error.toString()

            setError(errorMessage)
        }
    }
    //handle removing users
    const handleRemoveUsers = async () => {
        try {
            const usernamesArray = selectedUsersRemove.map((user) => user.username)
            await removeUsersFromRoom(roomId, usernamesArray)

            const response = await getRoomDetail(roomId)
            setRoom(response.data)

            setSelectedUsersRemove([])
        } catch (error) {
            const errorMessage =
                (error.response && error.response.data) ||
                error.message ||
                error.toString()

            setError(errorMessage)
        }
    }

    //for forms
    const handleSelectUserAdd = (user) => {
        if (!selectedUsersAdd.some((selected) => selected.id === user.id)) {
            setSelectedUsersAdd((prev) => [...prev, user])
        }
    }
    //for forms
    const handleClearUserAdd = (userId) => {
        setSelectedUsersAdd((prev) => prev.filter((user) => user.id !== userId))
    }

    // const handleSelectUserRemove = (user) => {
    //     if (!selectedUsersRemove.some((selected) => selected.id === user.id)) {
    //         setSelectedUsersRemove((prev) => [...prev, user])
    //     }
    // }

    const onSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    if (error) {
        return <div className='alert alert-danger'>{error}</div>
    }

    if (!room) {
        return <div>Loading...</div>
    }

    if (isLoadingUser) {
        return <div>Loading user data...</div>
    }

    return (
        <div className='container'>
            <div className='d-flex justify-content-between align-items-center'>
                <h3>{room.name}</h3>
                {currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                    <div className='d-flex justify-content-end'>
                        <button
                            className='btn btn-primary me-2'
                            data-bs-toggle='modal'
                            data-bs-target='#searchAndAddUsersModal'
                        >
                            Add Users
                        </button>
                        <button
                            className='btn btn-danger me-2'
                            data-bs-toggle='modal'
                            data-bs-target='#removeUsersModal'
                        >
                            Remove Users
                        </button>
                    </div>
                )}

            </div>
            <p>Room ID: {room.id}</p>
            <p>Room Creator: {room.createdBy}</p>
            <h5>Users in this room:</h5>
            <ul>
                {room.userList.map((user) => (
                    <li key={user.id}>
                        {user.username} - {user.email} ({user.role})
                    </li>
                ))}
            </ul>

            {/* Add user modal */}
            <div
                className='modal fade'
                id='searchAndAddUsersModal'
                tabIndex='-1'
                aria-labelledby='searchAndAddUsersModalLabel'
                aria-hidden='true'
            >
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='searchAndAddUsersModalLabel'>
                                Add users to this Room
                            </h5>
                            <button
                                type='button'
                                className='btn-close'
                                data-bs-dismiss='modal'
                                aria-label='Close'
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <div className='mb-3'>
                                <label htmlFor='searchQuery' className='form-label'>
                                    Enter username
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='searchQuery'
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    placeholder='Search for users...'
                                />
                            </div>
                            {searchResults.length > 0 ? (
                                <ul className='list-group'>
                                    {searchResults.map((user) => (
                                        <li
                                            key={user.id}
                                            className='list-group-item d-flex justify-content-between align-items-center'
                                        >
                                            {user.username}
                                            <button
                                                className='btn btn-sm btn-primary'
                                                onClick={() => handleSelectUserAdd(user)}
                                            >
                                                Add
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                searchQuery.length >= 3 && (
                                    <div className='alert alert-info mt-3'>
                                        No users found.
                                    </div>
                                )
                            )}
                            <h6 className='mt-4'>Selected Users:</h6>
                            <ul className='list-group'>
                                {selectedUsersAdd.map((user) => (
                                    <li
                                        key={user.id}
                                        className='list-group-item d-flex justify-content-between align-items-center'
                                    >
                                        {user.username}
                                        <button
                                            className='btn btn-sm btn-danger'
                                            onClick={() => handleClearUserAdd(user.id)}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {/* {message && (
                                <div className='alert alert-info mt-3'>{message}</div>
                            )} */}
                        </div>
                        <div className='modal-footer'>
                            <button
                                type='button'
                                className='btn btn-secondary'
                                data-bs-dismiss='modal'
                            >
                                Close
                            </button>
                            <button
                                type='button'
                                className='btn btn-primary'
                                onClick={handleAddUsers}
                                disabled={selectedUsersAdd.length === 0}
                            >
                                Add Selected Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remove user modal */}
            <div
                className='modal fade'
                id='removeUsersModal'
                tabIndex='-1'
                aria-labelledby='removeUsersModalLabel'
                aria-hidden='true'
            >
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='removeUsersModalLabel'>
                                Remove users from room
                            </h5>
                            <button
                                type='button'
                                className='btn-close'
                                data-bs-dismiss='modal'
                                aria-label='Close'
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <h6>Select users to remove:</h6>
                            <ul className='list-group'>
                                {room && room.userList.map((user) => (
                                    <li
                                        key={user.id}
                                        className='list-group-item d-flex justify-content-between align-items-center'
                                    >
                                        <div>
                                            <input
                                                type='checkbox'
                                                className='form-check-input me-2'
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsersRemove((prev) => [...prev, { username: user.username }])
                                                    } else {
                                                        setSelectedUsersRemove((prev) =>
                                                            prev.filter((selected) => selected.username !== user.username)
                                                        )
                                                    }
                                                }}
                                            >
                                            </input>
                                            {user.username}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className='modal-footer'>
                            <button
                                type='button'
                                className='btn btn-secondary'
                                data-bs-dismiss='modal'
                            >
                                Close
                            </button>
                            <button
                                type='button'
                                className='btn btn-danger'
                                onClick={
                                    handleRemoveUsers
                                    
                                }
                                disabled={selectedUsersRemove.length === 0}
                            >
                                Remove Selected Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomPage