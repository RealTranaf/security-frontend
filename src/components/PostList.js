import React, { useEffect, useState } from 'react'
import { getCommentsByPost, createComment } from '../services/comment-service'
import { getPostsByRoom, createPost } from '../services/post-service'

function PostList({ roomId, currentUser }) {

    const [posts, setPosts] = useState([])
    const [newPostContent, setNewPostContent] = useState('')

    const [comments, setComments] = useState({})
    const [loadingComments, setLoadingComments] = useState({})
    const [newCommentContent, setNewCommentContent] = useState({})

    const [currentPage, setCurrentPage] = useState(1)
    const [loadedCommentCounts, setLoadedCommentCounts] = useState({})

    const postsPerPage = 3;
    const commentsPerPage = 5;

    const fetchPosts = async () => {
        try {
            const response = await getPostsByRoom(roomId)
            const sortedPosts = response.data.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            setPosts(sortedPosts)

            sortedPosts.forEach((post) => {
                fetchComments(post.id);
            })
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [roomId])

    const handleAddPost = async () => {
        if (!newPostContent.trim) {
            return
        }
        try {
            await createPost(roomId, newPostContent)
            setNewPostContent('')

            fetchPosts()
        } catch (error) {
            console.error('Failed to create post:', error)
        }
    }

    const fetchComments = async (postId) => {
        // if (comments[postId]) {
        //     return
        // }
        setLoadingComments((prev) => ({ ...prev, [postId]: true }))
        try {
            const response = await getCommentsByPost(postId)
            const sortedComments = response.data.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            // setComments((prev) => ({ ...prev, [postId]: sortedComments }))

            const currentLoadedCount = loadedCommentCounts[postId] || 0
            const newLoadedCount = currentLoadedCount + commentsPerPage
            const newSlice = sortedComments.slice(0, newLoadedCount)
            const resortedComments = newSlice.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime))

            setComments((prev) => ({ ...prev, [postId]: resortedComments }))
            setLoadedCommentCounts((prev) => ({ ...prev, [postId]: newLoadedCount }))
            
        } catch (error) {
            console.error(`Failed to fetch comments for post ${postId}:`, error)
        } finally {
            setLoadingComments((prev) => ({ ...prev, [postId]: false }))
        }
    }

    const handleAddComment = async (postId) => {
        if (!newCommentContent[postId]?.trim()) {
            return
        }
        try {
            await createComment(postId, newCommentContent[postId])
            setNewCommentContent((prev) => ({ ...prev, [postId]: '' }))

            // const response = await getCommentsByPost(postId)
            // setComments((prev) => ({ ...prev, [postId]: response.data }))

            setLoadedCommentCounts((prev) => ({ ...prev, [postId]: commentsPerPage }))
            fetchComments(postId)
        } catch (error) {
            console.error(`Failed to add comment for post ${postId}:`, error);
        }
    }

    //pagination logic for posts
    const indexOfLastPost = currentPage * postsPerPage
    const indexOfFirstPost = indexOfLastPost - postsPerPage
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)

    const totalPages = Math.ceil(posts.length / postsPerPage)

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    return (
        <div className='mt-4'>
            <h5>Create a Post</h5>
            <div className='mb-3'>
                <textarea
                    className='form-control'
                    placeholder='Write a new post...'
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                >
                </textarea>
                <button className='btn btn-primary mt-2' onClick={handleAddPost}>
                    Post
                </button>
            </div>

            <h5>Posts</h5>
            {currentPosts.length === 0 ? (
                <p>No posts yet. Be the first one to post!</p>
            ) : (
                currentPosts.map((post) => (
                    <div key={post.id} className='card mb-3'>
                        <div className='card-body'>
                            <h6 className='card-title'>{post.author}</h6>
                            <p className='card-text'>{post.content}</p>
                            <p className='text-muted small'>
                                Created: {new Date(post.createdTime).toLocaleString()}
                            </p>
                            <hr />
                            <h6>Comments</h6>
                            {loadingComments[post.id] ? (
                                <p>Loading comments...</p>
                            ) : (
                                <>
                                    <ul className="list-group mb-3">
                                        {comments[post.id].length === 0 ? (
                                            <p>No comments yet.</p>
                                        ) : (
                                            (comments[post.id] || []).map((comment) => (
                                                <li key={comment.id} className="list-group-item">
                                                    <strong>{comment.author}:</strong> {comment.content}
                                                    <p className="text-muted small">
                                                        Created: {new Date(comment.createdTime).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                    {(comments[post.id].length || 0) >= (loadedCommentCounts[post.id] || 0) && (
                                        <button
                                            className="btn btn-link p-0 mb-3"
                                            onClick={() => fetchComments(post.id)}
                                        >
                                            Load More Comments
                                        </button>
                                    )}
                                </>
                            )}
                            <div className='d-flex'>
                                <input
                                    type='text'
                                    className='form-control me-2'
                                    value={newCommentContent[post.id] || ''}
                                    onChange={(e) =>
                                        setNewCommentContent((prev) => ({
                                            ...prev,
                                            [post.id]: e.target.value
                                        }))
                                    }
                                    placeholder='Write a comment...'
                                >
                                </input>
                                <button
                                    className='btn btn-primary'
                                    onClick={() => handleAddComment(post.id)}
                                >
                                    Comment
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <div className='d-flex justify-content-center mt-3'>
                <nav>
                    <ul className='pagination'>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={handlePreviousPage}
                            >
                                Back
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li
                                key={index + 1}
                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                <button
                                    className='page-link'
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={handleNextPage}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default PostList