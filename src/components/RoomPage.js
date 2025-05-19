import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRoomDetail } from '../services/room-service'
import { getCurrentUser } from '../services/user-service'

import '../App.css'
import PostList from './PostList'
import RoomSideBar from './RoomSidebar'
import RoomUsersPage from './RoomUsersPage'
import WeeklyReportPage from './WeeklyReportPage'

function RoomPage() {
    const { roomId } = useParams()
    const [room, setRoom] = useState(null)
    const [error, setError] = useState('')

    const [selectedPage, setSelectedPage] = useState('posts')

    const [isLoadingUser, setIsLoadingUser] = useState(true)

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

                setError(errorMessage)
            }
        }

        fetchRoomDetails()
    }, [roomId])

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
        <div className='container-fluid'>
            <div className='d-flex'>
                <div className='flex-grow-3'>
                    <RoomSideBar room={room} selectedPage={selectedPage} setSelectedPage={setSelectedPage}></RoomSideBar>
                </div>
                <div className='flex-grow-1 ms-4'>
                    {selectedPage === 'posts' && (
                        <PostList roomId={roomId} currentUser={currentUser}></PostList>
                    )}
                    {selectedPage === 'users' && (
                        <RoomUsersPage roomId={roomId} room={room} setRoom={setRoom} currentUser={currentUser}></RoomUsersPage>
                    )}
                    {selectedPage === 'weekly-report' && (
                        <WeeklyReportPage roomId={roomId} room={room} setRoom={setRoom} currentUser={currentUser}></WeeklyReportPage>
                    )}
                </div>
            </div>



        </div>
    )
}

export default RoomPage