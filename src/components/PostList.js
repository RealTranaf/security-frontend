import React, { useEffect, useState } from 'react'
import { getCommentsByPost, createComment } from '../services/comment-service'
import { getPostsByRoom, createPost } from '../services/post-service'

function PostList({ roomId, currentUser }) {

    const [posts, setPosts] = useState([])
    const [newPostContent, setNewPostContent] = useState('')

    const [comments, setComments] = useState({})
    const [loadingComments, setLoadingComments] = useState({})
    const [newCommentContent, setNewCommentContent] = useState({})

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // const [currentCommentPage, setCurrentCommentPage] = useState(0)
    // const [totalCommentPages, setTotalCommentPages] = useState(0)

    const [commentPagination, setCommentPagination] = useState({})

    const postsPerPage = 3;
    const commentsPerPage = 5;

    useEffect(() => {
        fetchPosts(currentPage)
    }, [currentPage])

    const fetchPosts = async (page) => {
        try {
            const response = await getPostsByRoom(roomId, page, postsPerPage)
            const sortedPosts = response.data.posts.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            setPosts(sortedPosts)
            setTotalPages(response.data.totalPages)

            sortedPosts.forEach((post) => {
                fetchComments(post.id, 0);
            })
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        }
    }

    const handleAddPost = async () => {
        if (!newPostContent.trim) {
            return
        }
        try {
            await createPost(roomId, newPostContent)
            setNewPostContent('')

            fetchPosts(0)
        } catch (error) {
            console.error('Failed to create post:', error)
        }
    }

    const fetchComments = async (postId, page) => {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }))
        try {
            const response = await getCommentsByPost(postId, page, commentsPerPage)
            const sortedComments = response.data.comments.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime))
            const totalCommentPages = response.data.totalPages


            setComments((prev) => ({ ...prev, [postId]: sortedComments }))
            setCommentPagination((prev) => ({ ...prev, [postId]: { currentCommentPage: page, totalCommentPages } }))

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
            fetchComments(postId, 0)
        } catch (error) {
            console.error(`Failed to add comment for post ${postId}:`, error);
        }
    }

    const renderPageNummbers = () => {
        const pageNumbers = []
        if (totalPages <= 10) {
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(
                    <li
                        key={i}
                        className={`page-item ${currentPage === i ? 'active' : ''}`}
                    >
                        <button
                            className='page-link'
                            onClick={() => handlePageChange(i)}
                        >
                            {i + 1}
                        </button>
                    </li>
                )
            }
        } else {
            if (currentPage < 4) {
                for (let i = 0; i < 5; i++) {
                    pageNumbers.push(
                        <li
                            key={i}
                            className={`page-item ${currentPage === i ? 'active' : ''}`}
                        >
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(i)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    )
                }
                pageNumbers.push(
                    <li key="ellipsis-end" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                )
                for (let i = totalPages - 2; i < totalPages; i++) {
                    pageNumbers.push(
                        <li
                            key={i}
                            className={`page-item ${currentPage === i ? 'active' : ''}`}
                        >
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(i)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    )
                }
            } else if (currentPage > totalPages - 5) {
                for (let i = 0; i < 2; i++) {
                    pageNumbers.push(
                        <li
                            key={i}
                            className={`page-item ${currentPage === i ? 'active' : ''}`}
                        >
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(i)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    )
                }
                pageNumbers.push(
                    <li key="ellipsis-end" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                )
                for (let i = totalPages - 5; i < totalPages; i++) {
                    pageNumbers.push(
                        <li
                            key={i}
                            className={`page-item ${currentPage === i ? 'active' : ''}`}
                        >
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(i)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    )
                }
            } else {
                pageNumbers.push(
                    <li
                        key={0}
                        className={`page-item ${currentPage === 0 ? 'active' : ''}`}
                    >
                        <button
                            className='page-link'
                            onClick={() => handlePageChange(0)}
                        >
                            1
                        </button>
                    </li>
                )
                pageNumbers.push(
                    <li key="ellipsis-start" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                )
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(
                        <li
                            key={i}
                            className={`page-item ${currentPage === i ? 'active' : ''}`}
                        >
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(i)}
                            >
                                {i + 1}
                            </button>
                        </li>
                    )
                }
                pageNumbers.push(
                    <li key="ellipsis-end" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                )
                pageNumbers.push(
                    <li
                        key={totalPages - 1}
                        className={`page-item ${currentPage === totalPages - 1 ? 'active' : ''}`}
                    >
                        <button
                            className='page-link'
                            onClick={() => handlePageChange(totalPages - 1)}
                        >
                            {totalPages}
                        </button>
                    </li>
                )
            }
        }
        return pageNumbers
    }

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    const renderCommentPagination = (postId) => {
        const pagination = commentPagination[postId] || { currentCommentPage: 0, totalCommentPages: 0 }
        const { currentCommentPage, totalCommentPages } = pagination
        return (
            <div className='d-flex justify-content-start mt-3'>
                <nav>
                    <ul className='pagination'>
                        <li className={`page-item ${currentCommentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, 0)}
                            >
                                &#171;
                            </button>
                        </li>
                        <li className={`page-item ${currentCommentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, currentCommentPage - 1)}
                            >
                                &#8249;
                            </button>
                        </li>
                        <li className={`page-item ${currentCommentPage === totalCommentPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, currentCommentPage + 1)}
                            >
                                &#8250;
                            </button>
                        </li>
                        <li className={`page-item ${currentCommentPage === totalCommentPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, totalCommentPages - 1)}
                            >
                                &#187;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        )
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
            {posts.length === 0 ? (
                <p>No posts yet. Be the first one to post!</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className='card mb-3'>
                        <div className='card-body'>
                            <h6 className='card-title' style={{ fontWeight: 'bold' }}>{post.author}</h6>
                            <p className='text-muted small'>
                                {new Date(post.createdTime).toLocaleString()}
                            </p>
                            <p className='card-text'>{post.content}</p>
                            <hr />
                            <h6>Comments</h6>
                            {loadingComments[post.id] ? (
                                <p>Loading comments...</p>
                            ) : (
                                <>
                                    {comments[post.id].length === 0 ? (
                                        <p>No comments yet.</p>
                                    ) : (
                                        <>
                                            <ul className="list-group mb-3">
                                                {comments[post.id]?.map((comment) => (
                                                    <li key={comment.id} className="list-group-item">
                                                        <strong>{comment.author}:</strong>
                                                        <p className="text-muted small">
                                                            {new Date(comment.createdTime).toLocaleString()}
                                                        </p>
                                                        {comment.content}
                                                    </li>
                                                ))}
                                            </ul>
                                            {renderCommentPagination(post.id)}
                                        </>
                                    )}
                                    {/* <ul className="list-group mb-3">
                                        {comments[post.id].length === 0 ? (
                                            <p>No comments yet.</p>
                                        ) : ( 
                                            comments[post.id]?.map((comment) => (
                                                <li key={comment.id} className="list-group-item">
                                                    <strong>{comment.author}:</strong>
                                                    <p className="text-muted small">
                                                        {new Date(comment.createdTime).toLocaleString()}
                                                    </p>
                                                    {comment.content}
                                                </li>
                                            ))
                                        )}
                                    </ul> */}
                                    {/* {renderCommentPagination(post.id)} */}
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
                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(0)}
                            >
                                &#171;
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={handlePreviousPage}
                            >
                                &#8249;
                            </button>
                        </li>
                        {renderPageNummbers()}
                        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={handleNextPage}
                            >
                                &#8250;
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(totalPages - 1)}
                            >
                                &#187;
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default PostList