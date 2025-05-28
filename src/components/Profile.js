import React, { useEffect, useState } from 'react'
import { getCurrentUser, getUser } from '../services/user-service'
import { useParams } from 'react-router-dom'

function Profile() {
    const [currentUser, setCurrentUser] = useState()
    const {username} = useParams()
    useEffect(() => {
        const fetchUser = async () => {
            try {

                // const response = await getCurrentUser()
                let response
                if (username) {
                    response = await getUser(username)
                } else {
                    response = await getCurrentUser()
                }
                const user = response.data
                // console.log(user)
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
        fetchUser()
    }, [username])

    if (!currentUser) {
        return <div>Loading...</div>
    }

    return (
        <div className='container mt-5'>
            <div className='card'>
                <div className='card-header bg-primary text-white'>
                    <h3 className='mb-0'>
                        <strong>{currentUser.username}</strong> Profile
                    </h3>
                </div>
                <div className='card-body'>
                    <p className='mb-2'>
                        <strong>Username:</strong> {currentUser.username}
                    </p>
                    <p className='mb-2'>
                        <strong>Email:</strong> {currentUser.email}
                    </p>
                    <p className='mb-2'>
                        <strong>Authorities:</strong> {currentUser.role}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Profile