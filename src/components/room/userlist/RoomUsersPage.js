import React, { useEffect, useState } from 'react'
import { getRoomDetail, addUserstoRoom, removeUsersFromRoom } from '../../../services/room-service'
import { searchUsers } from '../../../services/user-service'

function RoomUsersPage({ roomId, room, setRoom, currentUser }) {

    const [error, setError] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const [selectedUsersAdd, setSelectedUsersAdd] = useState([])
    const [selectedUsersRemove, setSelectedUsersRemove] = useState([])

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
    }, [searchQuery, room.userList])

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

    const sortedUserList = [...room.userList].sort((a, b) => {
        if (a.role < b.role) return -1
        if (a.role > b.role) return 1

        return a.username.localeCompare(b.username, undefined, { sensitivity: 'base'})
    })

    const refreshPage = async() => {
        const response = await getRoomDetail(roomId)
            setRoom(response.data)
    }

    const handleSelectUserAdd = (user) => {
        if (!selectedUsersAdd.some((selected) => selected.id === user.id)) {
            setSelectedUsersAdd((prev) => [...prev, user])
        }
    }
    //for forms
    const handleClearUserAdd = (userId) => {
        setSelectedUsersAdd((prev) => prev.filter((user) => user.id !== userId))
    }

    const onSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    if (error) {
        return <div className='alert alert-danger'>{error}</div>
    }

    if (!room) {
        return <div>Loading...</div>
    }

    return (
        <div className='mt-4'>
            <div className='d-flex justify-content-between align-items-center'>
                {currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                    <div className='d-flex justify-content-center'>
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
            <div className='mt-4'>
                <h3>Users in this room:</h3>
                <div className='table-responsive'>
                    <table className='table table-bordered align-middle'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUserList.map((user) => {
                                const isCurrentUser = currentUser && user.username === currentUser.username;
                                const isAdmin = user.role === 'ADMIN';
                                return (
                                    <tr key={user.id}>
                                        <td>{user.username} {isCurrentUser && <span className="text-muted">(You)</span>}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <button
                                                className='btn btn-sm btn-danger'
                                                disabled={isCurrentUser || isAdmin}
                                                onClick={async () => {
                                                    const confirmed = window.confirm(`Are you sure you want to remove ${user.username} from the room?`)
                                                    if (confirmed){
                                                        await removeUsersFromRoom(roomId, [user.username])
                                                        refreshPage()
                                                    }
                                                }}
                                            >
                                                Remove
                                            </button>
                                            {isAdmin && <span className="text-muted ms-2">(ADMIN)</span>}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
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
                                {room && room.userList.map((user) => {
                                    const isCurrentUser = currentUser && user.username === currentUser.username;
                                    const isAdmin = user.role === 'ADMIN';
                                    return (
                                        <li
                                            key={user.id}
                                            className='list-group-item d-flex justify-content-between align-items-center'
                                        >
                                            <div>
                                                <input
                                                    type='checkbox'
                                                    className='form-check-input me-2'
                                                    disabled={isCurrentUser || isAdmin}
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
                                                {isCurrentUser && (
                                                    <span className="text-muted ms-2">(You)</span>
                                                )}
                                                {isAdmin && (
                                                    <span className="text-muted ms-2">(ADMIN)</span>
                                                )}
                                            </div>
                                        </li>
                                    )
                                })}
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

export default RoomUsersPage