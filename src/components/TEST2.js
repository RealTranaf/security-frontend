import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRoomDetail, addUserstoRoom, removeUsersFromRoom } from '../services/room-service'
import { getCurrentUser, searchUsers } from '../services/user-service'
import { getPostsByRoom, createPost, addCommentToPost } from '../services/post-service'
import PostList from './PostList' // Import the PostList component

import '../App.css'

function RoomPage() {
    const { roomId } = useParams()
    const [room, setRoom] = useState(null)
    const [error, setError] = useState('')
    const [currentUser, setCurrentUser] = useState()
    const [posts, setPosts] = useState([]) // State for posts
    const [newPostContent, setNewPostContent] = useState('') // State for new post input
    const [newCommentContent, setNewCommentContent] = useState({}) // State for new comments

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedUsersAdd, setSelectedUsersAdd] = useState([])
    const [selectedUsersRemove, setSelectedUsersRemove] = useState([])
    const [isLoadingUser, setIsLoadingUser] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser()
                setCurrentUser(response.data)
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    window.location.href = "/login"
                } else {
                    console.error("Failed to fetch user:", error)
                }
            } finally {
                setIsLoadingUser(false)
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
                setError(error.response?.data || error.message || "Failed to fetch room details")
            }
        }

        const fetchPosts = async () => {
            try {
                const response = await getPostsByRoom(roomId)
                setPosts(response.data)
            } catch (error) {
                console.error("Failed to fetch posts:", error)
            }
        }

        fetchRoomDetails()
        fetchPosts()
    }, [roomId])

    const handlePostStatus = async () => {
        if (!newPostContent.trim()) return
        try {
            const response = await createPost(roomId, { content: newPostContent })
            setPosts((prevPosts) => [response.data, ...prevPosts])
            setNewPostContent('')
        } catch (error) {
            console.error("Failed to create post:", error)
        }
    }

    const handleAddComment = async (postId) => {
        if (!newCommentContent[postId]?.trim()) return
        try {
            const response = await addCommentToPost(postId, { content: newCommentContent[postId] })
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? { ...post, comments: [...post.comments, response.data] } : post
                )
            )
            setNewCommentContent((prev) => ({ ...prev, [postId]: '' }))
        } catch (error) {
            console.error("Failed to add comment:", error)
        }
    }

    const onSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>
    }

    if (!room) {
        return <div>Loading...</div>
    }

    if (isLoadingUser) {
        return <div>Loading user data...</div>
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center">
                <h3>{room.name}</h3>
                {currentUser && (currentUser.role === "TEACHER" || currentUser.role === "ADMIN") && (
                    <div className="d-flex justify-content-end">
                        <button
                            className="btn btn-primary me-2"
                            data-bs-toggle="modal"
                            data-bs-target="#searchAndAddUsersModal"
                        >
                            Add Users
                        </button>
                        <button
                            className="btn btn-danger me-2"
                            data-bs-toggle="modal"
                            data-bs-target="#removeUsersModal"
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

            {/* Post Status Section */}
            <div className="mt-4">
                <h5>Post a Status</h5>
                <textarea
                    className="form-control mb-2"
                    rows="3"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write something..."
                ></textarea>
                <button className="btn btn-primary" onClick={handlePostStatus}>
                    Post
                </button>
            </div>

            {/* Post List Section */}
            <PostList
                posts={posts}
                newCommentContent={newCommentContent}
                setNewCommentContent={setNewCommentContent}
                handleAddComment={handleAddComment}
            />
        </div>
    )
}

export default RoomPage