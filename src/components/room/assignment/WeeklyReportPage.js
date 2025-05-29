import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getWeeklyReportPosts, createWeeklyReportPost, submitWeeklyReport, getWeeklyReportSubmissions, gradeWeeklyReportSubmission, handleExportExcel, resubmitWeeklyReport, editWeeklyReportPost, deleteWeeklyReportPost, getUserWeeklyReportSubmissions } from '../../../services/weekly-report-service'
import { downloadFile } from '../../../services/download-service'
import GradeForm from './GradeForm'
import WeeklyReportPostList from './WeeklyReportPostList'

function WeeklyReportPage({ roomId, room, setRoom, currentUser }) {

    const [posts, setPosts] = useState([])
    const [newPostTitle, setNewPostTitle] = useState('')
    const [newPostContent, setNewPostContent] = useState('')
    const [newPostDeadline, setNewPostDeadline] = useState('')
    const [newPostFiles, setNewPostFiles] = useState([])
    const fileInputRef = useRef(null)

    const [selectedPost, setSelectedPost] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [reportContent, setReportContent] = useState('')
    const [reportFiles, setReportFiles] = useState([])

    const [editingPostId, setEditingPostId] = useState(null)
    const [editingPostTitle, setEditingPostTitle] = useState('')
    const [editingPostContent, setEditingPostContent] = useState('')
    const [editingPostDeadline, setEditingPostDeadline] = useState('')
    const [selectedEditFiles, setSelectedEditFiles] = useState([])
    const [filesToDelete, setFilesToDelete] = useState([])
    const editFileInputRef = useRef(null)

    const [mySubmissions, setMySubmissions] = useState([])

    const [showPostModal, setShowPostModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [showExpired, setShowExpired] = useState(false)

    const fetchPosts = useCallback(async () => {
        try {
            const response = await getWeeklyReportPosts(roomId)
            setPosts(response.data.posts)
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        }
    }, [roomId])

    useEffect(() => {
        fetchPosts()
    }, [roomId, fetchPosts])

    useEffect(() => {
        const fetchUserSubmissions = async () => {
            if (currentUser.role === 'STUDENT') {
                try {
                    const response = await getUserWeeklyReportSubmissions(roomId, currentUser.username)
                    setMySubmissions(response.data.studentSubmissions)
                } catch (error) {
                    console.error('Failed to get subs:', error)
                }
            }
        }
        fetchUserSubmissions()
    }, [roomId, currentUser])

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            return
        }

        try {
            for (const file of newPostFiles || []) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`File ${file.name} exceeds the 100MB limit. Please upload smaller files.`)
                    return
                }
            }
            await createWeeklyReportPost(roomId, newPostTitle, newPostContent, newPostDeadline, newPostFiles)
            closeCreateModal()
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            fetchPosts()
        } catch (error) {
            console.error('Failed to create posts:', error)
        }
    }

    const handleEditPost = (post) => {
        setEditingPostId(post.id)
        setEditingPostTitle(post.title)
        setEditingPostContent(post.content)
        setEditingPostDeadline(post.deadline ? post.deadline.substring(0, 16) : '')
        setSelectedEditFiles([])
        setFilesToDelete([])
        if (editFileInputRef.current) {
            editFileInputRef.current.value = ''
        }
    }

    const handleRemoveFile = (fileUrl) => {
        setFilesToDelete(prev => [...new Set([...prev, fileUrl])])
    }

    const handleSaveEditPost = async () => {
        if (!editingPostTitle.trim() || !editingPostContent.trim()) {
            return
        }
        try {
            for (const file of selectedEditFiles || []) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`File ${file.name} exceeds the 100MB limit. Please upload smaller files.`)
                    return
                }
            }
            await editWeeklyReportPost(roomId, editingPostId, editingPostTitle, editingPostContent, editingPostDeadline, selectedEditFiles, filesToDelete)
            setEditingPostId(null)
            setEditingPostTitle('')
            setEditingPostContent('')
            setEditingPostDeadline('')
            setSelectedEditFiles([])
            setFilesToDelete([])
            if (editFileInputRef.current) {
                editFileInputRef.current.value = ''
            }
            fetchPosts()
        } catch (error) {
            console.error('Failed to edit post: ', error)
        }
    }

    const handleDeletePost = async (reportPostId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteWeeklyReportPost(roomId, reportPostId)
                fetchPosts()
            } catch (error) {
                console.error('Failed to delete post: ', error)
            }
        }
    }

    const handleSelectPost = async (post) => {
        setSelectedPost(post)
        setShowPostModal(true)
        if (currentUser.role === 'TEACHER') {
            try {
                const response = await getWeeklyReportSubmissions(roomId, post.id)
                setSubmissions(response.data.submissions)
            } catch (error) {
                console.error('Failed to select posts:', error)
            }
        }

        if (currentUser.role === 'STUDENT') {
            try {
                const response = await getWeeklyReportSubmissions(roomId, post.id)
                setSubmissions(response.data.submissions)
            } catch (error) {
                console.error('Failed to select posts:', error)
            }
        }
    }

    const handleSubmitReport = async () => {
        if (!reportContent.trim()) {
            return
        }

        try {
            for (const file of reportFiles || []) {
                if (file.size > 100 * 1024 * 1024) {
                    alert(`File ${file.name} exceeds the 100MB limit. Please upload smaller files.`)
                    return
                }
            }
            if (getMySubmission()) {
                await resubmitWeeklyReport(roomId, selectedPost.id, reportContent, reportFiles)
            } else {
                await submitWeeklyReport(roomId, selectedPost.id, reportContent, reportFiles)
            }
            setReportContent('')
            setReportFiles([])
            fetchPosts()

            if (selectedPost) {
                const response = await getWeeklyReportSubmissions(roomId, selectedPost.id)
                setSubmissions(response.data.submissions)
            }

        } catch (error) {
            console.error('Failed to submit report:', error)
        }
    }

    const handleGrade = async (submissionId, grade, note) => {
        try {
            await gradeWeeklyReportSubmission(roomId, submissionId, grade, note)
            const response = await getWeeklyReportSubmissions(roomId, selectedPost.id)
            setSubmissions(response.data.submissions)
        } catch (error) {
            console.error('Failed to grade submission:', error)
        }
    }

    const getMySubmission = () => {
        if (!submissions) {
            return null
        }
        return submissions.find(submission => submission.author === currentUser.username)
    }

    const closePostModal = () => {
        setShowPostModal(false)
        setSelectedPost(null)
        setSubmissions([])
        setReportContent('')
        setReportFiles([])
    }

    const openCreateModal = () => {
        setShowCreateModal(true)
    }

    const closeCreateModal = () => {
        setShowCreateModal(false)
        setNewPostTitle('')
        setNewPostContent('')
        setNewPostDeadline('')
        setNewPostFiles([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // console.log(submissions)
    console.log(posts)

    const expiredPosts = posts.filter(post => post.expired)
    const currentPosts = posts.filter(post => !post.expired)

    return (
        <div className='mt-4'>
            {currentUser.role === 'TEACHER' && (
                <>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                        <button className='btn btn-primary' onClick={openCreateModal}>
                            <i className='bi bi-plus-circle me-2'></i>
                            Create Weekly Report Post
                        </button>
                    </div>
                    {showCreateModal && (
                        <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <div className='modal-dialog modal-lg modal-dialog-centered'>
                                <div className='modal-content'>
                                    <div className='modal-header'>
                                        <h5 className='modal-title'>Create a Weekly Report Post</h5>
                                        <button type='button' className='btn-close' onClick={closeCreateModal}></button>
                                    </div>
                                    <div className='modal-body'>
                                        <input
                                            className='form-control mb-2'
                                            placeholder='Add a title...'
                                            value={newPostTitle}
                                            required
                                            onChange={e => setNewPostTitle(e.target.value)}
                                        >
                                        </input>
                                        <div style={{ position: 'relative' }}>
                                            <textarea
                                                className='form-control'
                                                placeholder='Describe the report request...'
                                                value={newPostContent}
                                                onChange={e => setNewPostContent(e.target.value)}
                                                style={{ paddingRight: 40 }}
                                            >
                                            </textarea>
                                            <button
                                                type='button'
                                                className='attach-btn-inside-textarea'
                                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                                tabIndex={-1}
                                            >
                                                <i className='bi bi-paperclip fs-4' style={{ color: 'var(--main-red)' }}></i>
                                            </button>
                                            <input
                                                type='file'
                                                className='d-none'
                                                multiple
                                                ref={fileInputRef}
                                                onChange={e => setNewPostFiles(Array.from(e.target.files))}
                                            >
                                            </input>
                                        </div>
                                        {newPostFiles.length > 0 && (
                                            <div className='mt-2'>
                                                {newPostFiles.map((file, idx) => (
                                                    <span key={idx} className='badge bg-secondary me-2'>{file.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        <input
                                            className='form-control mt-2'
                                            type='datetime-local'
                                            value={newPostDeadline}
                                            onChange={e => setNewPostDeadline(e.target.value)}
                                        >
                                        </input>
                                    </div>
                                    <div className='modal-footer'>
                                        <button className='btn btn-secondary' onClick={closeCreateModal}>
                                            <i className='bi bi-x-lg me-1'></i>
                                            Cancel
                                        </button>
                                        <button className='btn btn-primary' onClick={handleCreatePost}>
                                            <i className='bi bi-send me-1'></i>
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <h5>Weekly Report Posts</h5>
            <div className='mb-3'>
                <button
                    className={`btn btn-sm me-2 ${!showExpired ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setShowExpired(false)}
                >
                    <i className='bi bi-list-task me-1'></i>
                    Current
                </button>
                <button
                    className={`btn btn-sm ${showExpired ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setShowExpired(true)}
                >
                    <i className='bi bi-archive me-1'></i>
                    Expired
                </button>
            </div>
            {posts.length === 0 ? (
                <p>No weekly report assignment yet.</p>
            ) : (
                <WeeklyReportPostList
                    posts={showExpired ? expiredPosts : currentPosts}
                    mySubmissions={mySubmissions}
                    currentUser={currentUser}
                    editingPostId={editingPostId}
                    editingPostTitle={editingPostTitle}
                    setEditingPostTitle={setEditingPostTitle}
                    editingPostContent={editingPostContent}
                    setEditingPostContent={setEditingPostContent}
                    editingPostDeadline={editingPostDeadline}
                    setEditingPostDeadline={setEditingPostDeadline}
                    selectedEditFiles={selectedEditFiles}
                    setSelectedEditFiles={setSelectedEditFiles}
                    filesToDelete={filesToDelete}
                    setFilesToDelete={setFilesToDelete}
                    editFileInputRef={editFileInputRef}
                    handleSelectPost={handleSelectPost}
                    handleEditPost={handleEditPost}
                    handleDeletePost={handleDeletePost}
                    handleRemoveFile={handleRemoveFile}
                    handleSaveEditPost={handleSaveEditPost}
                    setEditingPostId={setEditingPostId}
                >
                </WeeklyReportPostList>
            )}

            {showPostModal && selectedPost && (
                <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-xl modal-dialog-scrollable'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h4 className='modal-title'>{selectedPost.title}</h4>
                                <button type='button' className='btn-close' onClick={closePostModal}></button>
                            </div>
                            <div className='modal-body' style={{ maxHeight: '40rem', overflowY: 'auto' }}>
                                <p>{selectedPost.content}</p>
                                <p><strong>Deadline:</strong> {new Date(selectedPost.deadline).toLocaleString()}</p>
                                {selectedPost.fileUrls && selectedPost.fileUrls.length > 0 && (
                                    <div>
                                        <strong>Attachments:</strong>
                                        <div>
                                            {selectedPost.fileUrls.map((fileUrl, index) => {
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
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {currentUser.role === 'STUDENT' && (
                                    <div className='mt-3'>
                                        <h5>{getMySubmission() ? 'Resubmit Your Report?' : 'Submit Your Report'}</h5>
                                        <textarea
                                            className='form-control mb-2'
                                            placeholder='Your report...'
                                            value={reportContent}
                                            onChange={e => setReportContent(e.target.value)}
                                            required
                                        >
                                        </textarea>
                                        <input
                                            className='form-control mb-2'
                                            type='file'
                                            multiple
                                            onChange={e => setReportFiles(Array.from(e.target.files))}
                                        >
                                        </input>
                                        <button
                                            className='btn btn-success'
                                            onClick={handleSubmitReport}
                                        >
                                            <i className={`bi ${getMySubmission() ? 'bi-arrow-repeat' : 'bi-upload'} me-1`}></i>
                                            {getMySubmission() ? 'Resubmit' : 'Submit'}
                                        </button>
                                        {submissions && getMySubmission() && (
                                            <div className='mt-3'>
                                                <h6 style={{ fontWeight: 'bold' }}>Your Submissions:</h6>
                                                <div>{getMySubmission().content}</div>
                                                <div>
                                                    {getMySubmission().fileUrls && getMySubmission().fileUrls.length > 0 && (
                                                        <div>
                                                            {getMySubmission().fileUrls.map((fileUrl, index) => {
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
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                {getMySubmission().grade && (
                                                    <div>
                                                        <strong>Grade:</strong> {getMySubmission().grade}<br />
                                                        <strong>Teacher Note:</strong> {getMySubmission().teacherNote}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentUser.role === 'TEACHER' && (
                                    <div className='mt-4'>
                                        <h5>Student Submission</h5>
                                        {selectedPost.author === currentUser.username && (
                                            <button className='btn btn-success btn-sm' onClick={() => handleExportExcel(roomId, selectedPost.id, selectedPost.deadline)}>
                                                <i class='bi bi-filetype-xls me-2'></i>
                                                Export to Excel
                                            </button>
                                        )}
                                        <table className='table table-striped'>
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Status</th>
                                                    <th>Report</th>
                                                    <th>Files</th>
                                                    <th>Grade</th>
                                                    <th>Note</th>
                                                    <th>Submission Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submissions.map((sub) => {
                                                    const user = room.userList.find(u => u.username === sub.author)
                                                    return (
                                                        <tr key={user ? user.id : sub.author}>
                                                            <td>{user ? user.username : sub.author}</td>
                                                            <td>
                                                                Turned In
                                                                {sub.late
                                                                    ? <span className='badge bg-danger ms-2'>Late</span>
                                                                    : <span className='badge bg-success ms-2'>On Time</span>
                                                                }
                                                            </td>
                                                            <td>{sub.content}</td>
                                                            <td>
                                                                {sub.fileUrls && sub.fileUrls.length > 0 ? (
                                                                    <div>
                                                                        {sub.fileUrls.map((fileUrl, index) => {
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
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                ) : '-'}
                                                            </td>
                                                            <td>{sub.grade || '-'}</td>
                                                            <td>{sub.teacherNote || '-'}</td>
                                                            <td>{new Date(sub.submittedAt).toLocaleString().split(',')[0]}</td>
                                                            {selectedPost.author === currentUser.username && (
                                                                <td>
                                                                    <GradeForm
                                                                        initialGrade={sub.grade}
                                                                        initialNote={sub.teacherNote}
                                                                        onSave={(grade, note) => handleGrade(sub.id, grade, note)}
                                                                    />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    )
                                                })}

                                                {room.userList
                                                    .filter(user => user.role === 'STUDENT' && !submissions.some(sub => sub.author === user.username))
                                                    .map(user => {
                                                        return (
                                                            <tr
                                                                key={user.id}
                                                            >
                                                                <td>{user.username}</td>
                                                                <td>Not Turned In</td>
                                                                <td>-</td>
                                                                <td>-</td>
                                                                <td>-</td>
                                                                <td>-</td>
                                                                <td>-</td>
                                                                <td>-</td>
                                                            </tr>
                                                        )
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={closePostModal}>
                                    <i className='bi bi-x-lg me-1'></i>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WeeklyReportPage