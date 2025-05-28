import React, { useEffect, useState, useCallback, useRef } from 'react'
import { getCommentsByPost, createComment, editComment, deleteComment } from '../../../services/comment-service'
import { getPostsByRoom, createPost, deletePost, editPost } from '../../../services/post-service'
import Linkify from 'linkify-react'
import { Link } from 'react-router-dom'
import { downloadFile } from '../../../services/download-service'

function PostList({ roomId, currentUser }) {

    const [posts, setPosts] = useState([])
    const [newPostTitle, setNewPostTitle] = useState('')
    const [newPostContent, setNewPostContent] = useState('')

    const [comments, setComments] = useState({})
    const [loadingComments, setLoadingComments] = useState({})
    const [newCommentContent, setNewCommentContent] = useState({})

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [editingPostId, setEditingPostId] = useState(null)
    const [editingPostContent, setEditingPostContent] = useState('')
    const [editingPostTitle, setEditingPostTitle] = useState('')

    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editingCommentContent, setEditingCommentContent] = useState('')

    const [selectedFiles, setSelectedFiles] = useState([])
    const [selectedEditFiles, setSelectedEditFiles] = useState({})
    const fileInputRef = useRef(null)
    const [filesToDelete, setFilesToDelete] = useState({})

    const [selectedCommentFiles, setSelectedCommentFiles] = useState({})
    const [selectedEditCommentFiles, setSelectedEditCommentFiles] = useState({})
    const [commentFilesToDelete, setCommentFilesToDelete] = useState({})
    const commentFileInputRefs = useRef({})

    const [showPostModal, setShowPostModal] = useState(false)

    const [commentPagination, setCommentPagination] = useState({})

    const postsPerPage = 3
    const commentsPerPage = 5

    const fetchPosts = useCallback(async (page) => {
        try {
            const response = await getPostsByRoom(roomId, page, postsPerPage)
            const sortedPosts = response.data.posts.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
            setPosts(sortedPosts)
            setTotalPages(response.data.totalPages)

            sortedPosts.forEach((post) => {
                fetchComments(post.id, 0)
            })
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        }
    }, [roomId, postsPerPage])

    useEffect(() => {
        fetchPosts(currentPage)
    }, [currentPage, fetchPosts])

    const openPostModal = () => setShowPostModal(true)
    const closePostModal = () => {
        setShowPostModal(false)
        setNewPostTitle('')
        setNewPostContent('')
        setSelectedFiles([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleAddPost = async () => {
        if ((!newPostTitle.trim() && !newPostContent.trim()) && selectedFiles.length === 0) {
            return
        }

        for (const file of selectedFiles) {
            if (file.size > 100 * 1024 * 1024) {
                alert(`File ${file.name} exceeds the 100MB limit. Please upload smaller files.`)
                return
            }
        }

        try {
            await createPost(roomId, newPostTitle, newPostContent, selectedFiles)
            setNewPostContent('')
            setNewPostTitle('')
            setSelectedFiles([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            fetchPosts(0)
            closePostModal()
        } catch (error) {
            console.error('Failed to create post:', error)
        }
    }

    const handleDeletePost = async (postId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?')
        if (!confirmDelete) {
            return
        }
        try {
            await deletePost(roomId, postId)
            setPosts((prev) => prev.filter((post) => post.id !== postId))
            fetchPosts(currentPage)
        } catch (error) {
            console.log('Failed to delete post: ', error)
        }
    }

    const handleEditPost = (postId, title, content) => {
        setEditingPostId(postId)
        setEditingPostTitle(title)
        setEditingPostContent(content)
    }

    const handleSaveEditPost = async () => {
        const confirmEdit = window.confirm('Are you sure you want to save the changes to this post?')
        if (!confirmEdit) {
            return
        }
        try {

            await editPost(roomId, editingPostId, editingPostTitle, editingPostContent, selectedEditFiles[editingPostId] || [], filesToDelete[editingPostId] || [])
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === editingPostId ? { ...post, content: editingPostContent } : post
                )
            )
            setEditingPostId(null)
            setEditingPostContent('')
            setEditingPostTitle('')
            setSelectedEditFiles(prev => ({ ...prev, [editingPostId]: [] }))
            setFilesToDelete(prev => ({ ...prev, [editingPostId]: [] }))
            fetchPosts(currentPage)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Failed to edit post:', error)
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
        if (!newCommentContent[postId]?.trim() && (!selectedCommentFiles[postId] || selectedCommentFiles[postId].length === 0)) {
            return
        }
        try {
            // const content = newCommentContent[postId]
            for (const file of selectedCommentFiles[postId] || []) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`File ${file.name} exceeds the 100MB limit. Please upload smaller files.`)
                    return
                }
            }
            await createComment(postId, newCommentContent[postId], selectedCommentFiles[postId] || [])
            setNewCommentContent((prev) => ({ ...prev, [postId]: '' }))
            setSelectedCommentFiles((prev) => ({ ...prev, [postId]: [] }))

            if (commentFileInputRefs.current[postId]) {
                commentFileInputRefs.current[postId].value = ''
            }

            fetchComments(postId, 0)
        } catch (error) {
            console.error(`Failed to add comment for post ${postId}:`, error)
        }
    }

    const handleEditComment = (commmentId, content) => {
        setEditingCommentId(commmentId)
        setEditingCommentContent(content)
    }

    const handleSaveEditComment = async (postId) => {
        const confirmEdit = window.confirm('Are you sure you want to save the changes to this comment?')
        if (!confirmEdit) {
            return
        }
        try {
            await editComment(postId, editingCommentId, editingCommentContent, selectedEditCommentFiles[editingCommentId] || [], commentFilesToDelete[editingCommentId] || [])
            setComments((prev) => ({
                ...prev,
                [postId]: prev[postId].map((comment) =>
                    comment.id === editingCommentId ? { ...comment, content: editingCommentContent } : comment
                ),
            }))
            setEditingCommentId(null)
            setEditingCommentContent('')
            setSelectedEditCommentFiles(prev => ({ ...prev, [editingCommentId]: [] }))
            setCommentFilesToDelete(prev => ({ ...prev, [editingCommentId]: [] }))
            if (commentFileInputRefs.current[postId]) {
                commentFileInputRefs.current[postId].value = ''
            }
            fetchPosts(currentPage)
        } catch (error) {
            console.error('Failed to edit comment: ', error)
        }
    }

    const handleDeleteComment = async (postId, commentId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this comment?')
        if (!confirmDelete) {
            return
        }
        try {
            await deleteComment(postId, commentId)
            setComments((prev) => ({
                ...prev,
                [postId]: prev[postId].filter((comment) => comment.id !== commentId),
            }))
        } catch (error) {
            console.error('Failed to delete comment:', error)
        }
    }

    const handleEditPostFileChange = (postId, files) => {
        setSelectedEditFiles(prev => ({
            ...prev,
            [postId]: Array.from(files)
        }))
    }

    const handleRemoveFile = (postId, fileUrl) => {
        setFilesToDelete(prev => ({
            ...prev,
            [postId]: [...new Set([...(prev[postId] || []), fileUrl])]
        }))
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        fileUrls: post.fileUrls.filter((url) => url !== fileUrl),
                    }
                    : post
            )
        )
    }

    const handleCommentFileChange = (postId, files) => {
        setSelectedCommentFiles(prev => ({
            ...prev,
            [postId]: Array.from(files)
        }))
    }

    const handleEditCommentFileChange = (commentId, files) => {
        setSelectedEditCommentFiles(prev => ({
            ...prev,
            [commentId]: Array.from(files)
        }))
    }

    const handleRemoveCommentFile = (commentId, fileUrl) => {
        setCommentFilesToDelete(prev => ({
            ...prev,
            // [commentId]: [...(prev[commentId] || []), fileUrl]
            [commentId]: [...new Set([...(prev[commentId] || []), fileUrl])]
        }))
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
                    <li key='ellipsis-end' className='page-item disabled'>
                        <span className='page-link'>...</span>
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
                    <li key='ellipsis-end' className='page-item disabled'>
                        <span className='page-link'>...</span>
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
                    <li key='ellipsis-start' className='page-item disabled'>
                        <span className='page-link'>...</span>
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
                    <li key='ellipsis-end' className='page-item disabled'>
                        <span className='page-link'>...</span>
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
                                &#171
                            </button>
                        </li>
                        <li className={`page-item ${currentCommentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, currentCommentPage - 1)}
                            >
                                &#8249
                            </button>
                        </li>
                        <li className={`page-item ${currentCommentPage === totalCommentPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, currentCommentPage + 1)}
                            >
                                &#8250
                            </button>
                        </li>
                        <li className={`page-item ${currentCommentPage === totalCommentPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => fetchComments(postId, totalCommentPages - 1)}
                            >
                                &#187
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }

    return (
        <div className='mt-4'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <button className='btn btn-primary' onClick={openPostModal}>
                    <i className='bi bi-plus-circle me-2'></i>
                    Create a Post
                </button>
            </div>
            {/* Modal to create post */}
            {showPostModal && (
                <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Create a Post</h5>
                                <button type='button' className='btn-close' onClick={closePostModal}></button>
                            </div>
                            <div className='modal-body'>
                                <input
                                    className='form-control mb-2'
                                    placeholder='Add a title...'
                                    value={newPostTitle}
                                    required
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                >
                                </input>

                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        className='form-control'
                                        placeholder='Write a new post...'
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        style={{ paddingRight: 40 }}
                                    >
                                    </textarea>
                                    <button
                                        type='button'
                                        className='attach-btn-inside-textarea'
                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                        tabIndex={-1}
                                        aria-label='Attach files'
                                    >
                                        <i className='bi bi-paperclip fs-4' style={{ color: '#7a2424' }}></i>
                                    </button>
                                    <input
                                        type='file'
                                        className='d-none'
                                        multiple
                                        ref={fileInputRef}
                                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                    >
                                    </input>
                                </div>
                                {selectedFiles.length > 0 && (
                                    <div className='mt-2'>
                                        {selectedFiles.map((file, index) => (
                                            <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={closePostModal}>
                                    <i className='bi bi-x-lg me-1'></i>
                                    Cancel
                                </button>
                                <button className='btn btn-primary' onClick={handleAddPost}>
                                    <i className='bi bi-send me-1'></i>
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {posts.length === 0 ? (
                <p>No posts yet. Be the first one to post!</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className='card mb-3'>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <Link
                                    to={`/profile/${post.author}`}
                                    target='_blank'
                                    className='text-decoration-none'
                                    style={{ fontWeight: 'bold', color: 'inherit' }}
                                >
                                    <h3 className='card-title' style={{ fontWeight: 'bold', color: 'inherit' }}>{post.author}</h3>
                                </Link>
                                {(currentUser?.username === post.author || currentUser?.role === 'ADMIN') && (
                                    <div className='d-flex justify-content-end'>
                                        <span
                                            className='btn btn-link p-0 me-2'
                                            style={{ color: '#ffc107' }}
                                            onClick={() => handleEditPost(post.id, post.content)}
                                            title='Edit'
                                        >
                                            <i className='bi bi-pencil-square fs-3'></i>
                                        </span>
                                        <span
                                            className='btn btn-link p-0'
                                            style={{ color: '#dc3545' }}
                                            onClick={() => handleDeletePost(post.id)}
                                            title='Delete'
                                        >
                                            <i className='bi bi-trash-fill fs-3'></i>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className='text-muted small'>
                                {new Date(post.createdTime).toLocaleString()}
                            </p>
                            {editingPostId === post.id ? (
                                <div>
                                    <input
                                        className='form-control mb-2'
                                        placeholder='Add a title...'
                                        value={editingPostTitle}
                                        required
                                        onChange={(e) => setEditingPostTitle(e.target.value)}
                                    ></input>
                                    <div style={{ position: 'relative' }}>
                                        <textarea
                                            className='form-control mb-2'
                                            value={editingPostContent}
                                            onChange={(e) => setEditingPostContent(e.target.value)}
                                            style={{ paddingRight: 40 }}
                                        >
                                        </textarea>
                                        <button
                                            type='button'
                                            className='attach-btn-inside-textarea'
                                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                            tabIndex={-1}
                                        >
                                            <i className='bi bi-paperclip fs-4' style={{ color: '#7a2424' }}></i>
                                        </button>
                                        <input
                                            type='file'
                                            className='d-none'
                                            multiple
                                            ref={fileInputRef}
                                            onChange={e => handleEditPostFileChange(post.id, e.target.files)}
                                        >
                                        </input>
                                    </div>
                                    {selectedEditFiles[post.id] && selectedEditFiles[post.id].length > 0 && (
                                        <div className='mt-2'>
                                            {selectedEditFiles[post.id].map((file, index) => (
                                                <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        className='btn btn-sm btn-success me-2'
                                        onClick={handleSaveEditPost}
                                    >
                                        <i className='bi bi-check-lg me-1'></i>
                                        Save
                                    </button>
                                    <button
                                        className='btn btn-sm btn-secondary me-2'
                                        onClick={() => setEditingPostId(null)}
                                    >
                                        <i className='bi bi-x-lg me-1'></i>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h4 className='card-title' style={{ fontWeight: 'bold' }}>{post.title}</h4>
                                    {post.content && (
                                        <p
                                            className='card-text'
                                            style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            <Linkify options={{ target: '_blank', rel: 'noopener noreferrer' }}>
                                                {post.content}
                                            </Linkify>
                                        </p>
                                    )}
                                </div>
                            )}

                            {post.fileUrls && post.fileUrls.length > 0 && (
                                <div className='mt-3'>
                                    {post.fileUrls
                                        .filter(fileUrl => !(filesToDelete[post.id] || []).includes(fileUrl))
                                        .map((fileUrl, index) => {
                                            const fileName = fileUrl.split('/').pop()
                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                            return (
                                                <div key={index}>
                                                    <span
                                                        className='btn btn-link p-0'
                                                        style={{ textDecoration: 'underline' }}
                                                        onClick={() => downloadFile(fileUrl, fileName)}
                                                    >
                                                        <i className='bi bi-paperclip me-1'></i>
                                                        {originalName}
                                                    </span>
                                                    {editingPostId === post.id && (
                                                        <span
                                                            className='btn btn-sm'
                                                            onClick={() => handleRemoveFile(post.id, fileUrl)}
                                                            style={{ cursor: 'pointer' }}
                                                            title='Delete'
                                                        >
                                                            <i className='bi bi-x-lg'></i>
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            )}
                            {selectedEditFiles[post.id] && selectedEditFiles[post.id].length > 0 && (
                                <div className='mt-2'>
                                    {selectedEditFiles[post.id].map((file, index) => (
                                        <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                    ))}
                                </div>
                            )}
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
                                            <ul className='list-group mb-3'>
                                                {comments[post.id]?.map((comment) => (
                                                    <li key={comment.id} className='list-group-item'>
                                                        <div className='d-flex justify-content-between align-items-center'>
                                                            <Link
                                                                to={`/profile/${comment.author}`}
                                                                className='text-decoration-none'
                                                                style={{ fontWeight: 'bold', color: 'inherit' }}
                                                                target='_blank'
                                                            >
                                                                {comment.author}
                                                            </Link>
                                                            {(currentUser?.username === comment.author || currentUser?.role === 'ADMIN') && (
                                                                <div className='d-flex justify-content-end'>
                                                                    <span
                                                                        className='btn btn-link p-0 me-2'
                                                                        style={{ color: '#ffc107' }}
                                                                        onClick={() => handleEditComment(comment.id, comment.content)}
                                                                        title='Edit'
                                                                    >
                                                                        <i className='bi bi-pencil-square'></i>
                                                                    </span>
                                                                    <span
                                                                        className='btn btn-link p-0'
                                                                        style={{ color: '#dc3545' }}
                                                                        onClick={() => handleDeleteComment(post.id, comment.id)}
                                                                        title='Delete'
                                                                    >
                                                                        <i className='bi bi-trash-fill'></i>
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className='text-muted small'>
                                                            {new Date(comment.createdTime).toLocaleString()}
                                                        </p>
                                                        {editingCommentId === comment.id ? (
                                                            <div>
                                                                <div style={{ position: 'relative' }}>
                                                                    <textarea
                                                                        className='form-control mb-2'
                                                                        value={editingCommentContent}
                                                                        onChange={(e) => setEditingCommentContent(e.target.value)}
                                                                        style={{ paddingRight: 40 }}
                                                                    >
                                                                    </textarea>
                                                                    <button
                                                                        type='button'
                                                                        className='attach-btn-inside-textarea'
                                                                        onClick={() => commentFileInputRefs.current[post.id] && commentFileInputRefs.current[post.id].click()}
                                                                        tabIndex={-1}
                                                                        aria-label='Attach files'
                                                                    >
                                                                        <i className='bi bi-paperclip fs-4' style={{ color: '#7a2424' }}></i>
                                                                    </button>
                                                                    <input
                                                                        type='file'
                                                                        className='d-none'
                                                                        multiple
                                                                        ref={el => commentFileInputRefs.current[post.id] = el}
                                                                        onChange={e => handleEditCommentFileChange(comment.id, e.target.files)}
                                                                    >
                                                                    </input>
                                                                </div>
                                                                {selectedEditCommentFiles[comment.id] && selectedEditCommentFiles[comment.id].length > 0 && (
                                                                    <div className='mt-2'>
                                                                        {selectedEditCommentFiles[comment.id].map((file, index) => (
                                                                            <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <button
                                                                    className='btn btn-sm btn-success me-2'
                                                                    onClick={() => handleSaveEditComment(post.id)}
                                                                >
                                                                    <i className='bi bi-check-lg me-1'></i>
                                                                    Save
                                                                </button>
                                                                <button
                                                                    className='btn btn-sm btn-secondary'
                                                                    onClick={() => setEditingCommentId(null)}
                                                                >
                                                                    <i className='bi bi-x-lg me-1'></i>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                {comment.content && (
                                                                    <p style={{ whiteSpace: 'pre-wrap' }}>
                                                                        <Linkify options={{ target: '_blank', rel: 'noopener noreferrer' }}>
                                                                            {comment.content}
                                                                        </Linkify>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {comment.fileUrls && comment.fileUrls.length > 0 && (
                                                            <div className='mt-2'>
                                                                {comment.fileUrls
                                                                    .filter(fileUrl => !(commentFilesToDelete[comment.id] || []).includes(fileUrl))
                                                                    .map((fileUrl, index) => {
                                                                        const fileName = fileUrl.split('/').pop()
                                                                        const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                                        return (
                                                                            <div key={index}>
                                                                                <span
                                                                                    className='btn btn-link p-0'
                                                                                    style={{ textDecoration: 'underline' }}
                                                                                    onClick={() => downloadFile(fileUrl, fileName)}
                                                                                >
                                                                                    <i className='bi bi-paperclip me-1'></i>
                                                                                    {originalName}
                                                                                </span>
                                                                                {editingCommentId === comment.id && (
                                                                                    <span
                                                                                        onClick={() => {
                                                                                            handleRemoveCommentFile(comment.id, fileUrl)
                                                                                            console.log(commentFilesToDelete)
                                                                                        }}
                                                                                        style={{ cursor: 'pointed' }}
                                                                                        title='Delete'
                                                                                        className='btn btn-sm'
                                                                                    >
                                                                                        <i className='bi bi-x-lg'></i>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })}
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            {renderCommentPagination(post.id)}
                                        </>
                                    )}
                                </>
                            )}
                            <div className='d-flex'>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <textarea
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
                                        style={{ paddingRight: 40 }}
                                    >
                                    </textarea>
                                    <button
                                        type='button'
                                        className='attach-btn-inside-textarea'
                                        onClick={() => commentFileInputRefs.current[post.id] && commentFileInputRefs.current[post.id].click()}
                                        tabIndex={-1}
                                    >
                                        <i className='bi bi-paperclip fs-4' style={{ color: '#7a2424' }}></i>
                                    </button>
                                    <input
                                        type='file'
                                        className='d-none'
                                        multiple
                                        ref={el => commentFileInputRefs.current[post.id] = el}
                                        onChange={e => handleCommentFileChange(post.id, e.target.files)}
                                    >
                                    </input>
                                </div>
                                <button
                                    className='btn btn-primary ms-2'
                                    onClick={() => handleAddComment(post.id)}
                                >
                                    <i className='bi bi-send me-1'></i>
                                </button>
                            </div>
                            {selectedCommentFiles[post.id] && selectedCommentFiles[post.id].length > 0 && (
                                <div className='mt-2'>
                                    {selectedCommentFiles[post.id].map((file, index) => (
                                        <span
                                            key={index}
                                            className='badge bg-secondary me-2'
                                        >
                                            {file.name}
                                        </span>
                                    ))}
                                </div>
                            )}
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
                                &#171
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={handlePreviousPage}
                            >
                                &#8249
                            </button>
                        </li>
                        {renderPageNummbers()}
                        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={handleNextPage}
                            >
                                &#8250
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className='page-link'
                                onClick={() => handlePageChange(totalPages - 1)}
                            >
                                &#187
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default PostList