import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getStudentSubmissionsByPost, getWeeklyReportPosts, createWeeklyReportPost, submitWeeklyReport, getWeeklyReportSubmissions, gradeWeeklyReportSubmission, handleExportExcel, editWeeklyReportPost, deleteWeeklyReportPost, getUserWeeklyReportSubmissions } from '../../../services/weekly-report-service'
import { downloadFile } from '../../../services/download-service'
import GradeForm from './GradeForm'
import WeeklyReportPostList from './WeeklyReportPostList'

function WeeklyReportPage({ roomId, room, currentUser }) {

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

    const [showPastSubs, setShowPastSubs] = useState(false)
    const [pastSubs, setPastSubs] = useState([])
    const [pastSubsUser, setPastSubsUser] = useState(null)

    const fetchPosts = useCallback(async () => {
        try {
            const response = await getWeeklyReportPosts(roomId)
            setPosts(response.data.posts)
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        }
    }, [roomId])

    const fetchPastSubsForUser = async (username) => {
        if (selectedPost && currentUser.role === 'TEACHER') {
            try {
                const res = await getStudentSubmissionsByPost(roomId, selectedPost.id, username)
                setPastSubs(res.data.studentSubmissions || [])
                setPastSubsUser(username)
                setShowPastSubs(true)
            } catch (error) {
                setPastSubs([])
                setPastSubsUser(username)
                setShowPastSubs(true)
                console.error(error)
            }
        }
    }
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
        try {
            const response = await getWeeklyReportSubmissions(roomId, post.id)
            setSubmissions(response.data.submissions)
        } catch (error) {
            console.error('Failed to select posts:', error)
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
            await submitWeeklyReport(roomId, selectedPost.id, reportContent, reportFiles)
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

    const handleGrade = async (submissionId, grade, note, files) => {
        try {
            await gradeWeeklyReportSubmission(roomId, submissionId, grade, note, files)
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
                            <div className='modal-dialog modal-lg '>
                                <div className='modal-content'>
                                    <div className='modal-header'>
                                        <h5 className='modal-title'>Create a Weekly Report Post</h5>
                                        <button type='button' className='btn-close' onClick={closeCreateModal}></button>
                                    </div>
                                    <div className='modal-body'>
                                        <label className='form-label fw-semibold'>Title</label>
                                        <input
                                            className='form-control mb-2'
                                            placeholder='Add a title...'
                                            value={newPostTitle}
                                            required
                                            onChange={e => setNewPostTitle(e.target.value)}
                                        >
                                        </input>
                                        <div className='position-relative'>
                                            <label className='form-label fw-semibold'>Description</label>
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
                                                {newPostFiles.map((file, index) => (
                                                    <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className='position-relative mt-2'>
                                            <label className='form-label fw-semibold'>Deadline</label>
                                            <input
                                                className='form-control'
                                                type='datetime-local'
                                                value={newPostDeadline}
                                                onChange={e => setNewPostDeadline(e.target.value)}
                                            >
                                            </input>
                                        </div>
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
                                <p className='fs-5'>{selectedPost.content}</p>
                                <p>
                                    <strong>Deadline:</strong>
                                    {new Date(selectedPost.deadline).toLocaleString()}
                                </p>
                                {selectedPost.fileUrls && selectedPost.fileUrls.length > 0 && (
                                    <div className='mb-2'>
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
                                        <div className='position-relative'>
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
                                                onChange={e => setReportFiles(Array.from(e.target.files))}
                                            >
                                            </input>
                                        </div>
                                        {reportFiles.length > 0 && (
                                            <div className='mt-2'>
                                                {reportFiles.map((file, index) => (
                                                    <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            className='btn btn-primary mt-2'
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
                                                {getMySubmission().teacherFileUrls && getMySubmission().teacherFileUrls.length > 0 && (
                                                    <div>
                                                        <strong>Teacher Attachments:</strong>
                                                        {getMySubmission().teacherFileUrls.map((fileUrl, idx) => {
                                                            const fileName = fileUrl.split('/').pop()
                                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                            return (
                                                                <div key={idx}>
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
                                        )}
                                    </div>
                                )}

                                {currentUser.role === 'TEACHER' && (
                                    <div className='mt-4'>
                                        <h5>Student Submission</h5>
                                        {selectedPost.author === currentUser.username && (
                                            <button className='btn btn-primary' onClick={() => handleExportExcel(roomId, selectedPost.id, selectedPost.title)}>
                                                <i className='bi bi-filetype-xls me-2'></i>
                                                Export to Excel
                                            </button>
                                        )}
                                        <table className='table table-striped mt-2'>
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Status</th>
                                                    {/* <th>Report</th> */}
                                                    <th>Files</th>
                                                    <th>Grade</th>
                                                    <th>Note</th>
                                                    <th>Note's Attachments</th>
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
                                                            {/* <td>{sub.content}</td> */}
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
                                                            <td>
                                                                {sub.teacherFileUrls && sub.teacherFileUrls.length > 0 ? (
                                                                    <div>
                                                                        {sub.teacherFileUrls.map((fileUrl, idx) => {
                                                                            const fileName = fileUrl.split('/').pop()
                                                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                                            return (
                                                                                <div key={idx}>
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
                                                                ) : ('-')}
                                                            </td>
                                                            <td>{new Date(sub.submittedAt).toLocaleString().split(',')[0]}</td>
                                                            {selectedPost.author === currentUser.username && (
                                                                <td>
                                                                    <GradeForm
                                                                        initialGrade={sub.grade}
                                                                        initialNote={sub.teacherNote}
                                                                        onSave={(grade, note, files) => handleGrade(sub.id, grade, note, files)}
                                                                    />
                                                                </td>
                                                            )}
                                                            <td>
                                                                <button
                                                                    className='btn btn-outline-secondary btn-sm'
                                                                    type='button'
                                                                    onClick={() => fetchPastSubsForUser(sub.author)}
                                                                >
                                                                    <i className='bi bi-clock-history me-1'></i>
                                                                    View History
                                                                </button>
                                                            </td>
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
                                                                {/* <td>-</td> */}
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
                                        {showPastSubs && (
                                            <div className='modal d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.3)' }}>
                                                <div className='modal-dialog modal-lg'>
                                                    <div className='modal-content'>
                                                        <div className='modal-header'>
                                                            <h5 className='modal-title'>
                                                                {pastSubsUser ? `All Submissions for ${pastSubsUser}` : 'Submission History'}
                                                            </h5>
                                                            <button type='button' className='btn-close' onClick={() => setShowPastSubs(false)}></button>
                                                        </div>
                                                        <div className='modal-body' style={{ maxHeight: '40rem', overflowY: 'auto' }}>
                                                            {pastSubs.length === 0 && (
                                                                <div className='text-muted'>No past submissions found.</div>
                                                            )}
                                                            {pastSubs.map((sub) => (
                                                                <div
                                                                    key={sub.id}
                                                                    className={`border rounded p-2 mb-3 ${sub.active ? ' border-success' : 'border-danger'}`}
                                                                    style={{ background: sub.active ? '#e9fbe9' : '#fff' }}
                                                                >
                                                                    <div>
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <div>
                                                                                <strong>Submitted at:</strong>
                                                                                <span className="ms-2">{new Date(sub.submittedAt).toLocaleString()}</span>
                                                                            </div>
                                                                            {/* {sub.active && (
                                                                                <span className="badge bg-success ms-2">Active</span>
                                                                            )} */}
                                                                            {sub.grade && (
                                                                                <span
                                                                                    className="badge bg-primary fs-6"
                                                                                >
                                                                                    Grade: {sub.grade}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-2" style={{ whiteSpace: 'pre-line' }}>{sub.content}</div>
                                                                    <div className='mb-2'>
                                                                        {sub.fileUrls && sub.fileUrls.length > 0 && (
                                                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                                                <strong>Attachments:</strong>
                                                                                {sub.fileUrls.map((fileUrl, index) => {
                                                                                    const fileName = fileUrl.split('/').pop()
                                                                                    const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                                                    return (
                                                                                        <span
                                                                                            key={index}
                                                                                            className='btn btn-link p-0'
                                                                                            style={{ textDecoration: 'underline' }}
                                                                                            onClick={() => downloadFile(fileUrl, fileName)}
                                                                                        >
                                                                                            <i className='bi bi-paperclip'></i>
                                                                                            {originalName}
                                                                                        </span>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {sub.grade && (
                                                                        <div>
                                                                            <strong>Grade:</strong> {sub.grade}<br />
                                                                            <strong>Teacher's notes:</strong> {sub.teacherNote}
                                                                        </div>
                                                                    )}
                                                                    <div className='mb-2'>
                                                                        {sub.teacherFileUrls && sub.teacherFileUrls.length > 0 && (
                                                                                <div className="d-flex flex-wrap gap-2 mt-1">
                                                                                    <strong>Teacher Attachments:</strong>
                                                                                    {sub.teacherFileUrls.map((fileUrl, idx) => {
                                                                                        const fileName = fileUrl.split('/').pop()
                                                                                        const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                                                        return (
                                                                                            <div key={idx}>
                                                                                                <span
                                                                                                    className='btn btn-link p-0'
                                                                                                    style={{ textDecoration: 'underline' }}
                                                                                                    onClick={() => downloadFile(fileUrl, fileName)}
                                                                                                >
                                                                                                    <i className='bi bi-paperclip'></i>
                                                                                                    {originalName}
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className='modal-footer'>
                                                            <button className='btn btn-secondary' onClick={() => setShowPastSubs(false)}>
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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