import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getWeeklyReportPosts, createWeeklyReportPost, submitWeeklyReport, getWeeklyReportSubmissions, gradeWeeklyReportSubmission } from '../services/weekly-report-service'
import { downloadFile } from '../services/download-service'
import GradeForm from './GradeForm'

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

    const [showPostModal, setShowPostModal] = useState(false)

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

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            return
        }

        try {
            await createWeeklyReportPost(roomId, newPostTitle, newPostContent, newPostDeadline, newPostFiles)
            setNewPostTitle('')
            setNewPostContent('')
            setNewPostDeadline('')
            setNewPostFiles([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            fetchPosts()
        } catch (error) {
            console.error('Failed to create posts:', error)
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

    return (
        <div className='mt-3'>
            {currentUser.role === 'TEACHER' && (
                <>
                    <h5>Create a Weekly Report Post</h5>
                    <div className='mb-3'>
                        <input
                            className='form-control mb-2'
                            placeholder='Add a title...'
                            value={newPostTitle}
                            required
                            onChange={e => setNewPostTitle(e.target.value)}
                        >
                        </input>
                        <textarea
                            className='form-control'
                            placeholder='Describe the report request...'
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                        >
                        </textarea>
                        <input
                            className='form-control mt-2'
                            type='datetime-local'
                            value={newPostDeadline}
                            onChange={e => setNewPostDeadline(e.target.value)}
                        >
                        </input>
                        <input
                            type='file'
                            className='form-control mt-2'
                            multiple
                            ref={fileInputRef}
                            onChange={e => setNewPostFiles(Array.from(e.target.files))}
                        >
                        </input>
                        <button className='btn btn-primary mt-2' onClick={handleCreatePost}>
                            Post
                        </button>
                    </div>
                </>
            )}

            <h5>Weekly Report Posts</h5>
            {posts.length === 0 ? (
                <p>No weekly report assignment yet.</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className='card mb-3'>
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-center'>
                                <h4 className='card-title' style={{ fontWeight: 'bold' }}>{post.title}</h4>
                                <button className='btn btn-outline-info btn-sm' onClick={() => handleSelectPost(post)}>
                                    View
                                </button>
                            </div>
                            <p className='text-muted small'>
                                Deadline: {new Date(post.deadline).toLocaleString()}
                            </p>
                            <p>{post.content}</p>
                            {post.fileUrls && post.fileUrls.length > 0 && (
                                <div className='mt-3'>
                                    <strong>Attachments:</strong>
                                    <div>
                                        {post.fileUrls.map((fileUrl, index) => {
                                            const fileName = fileUrl.split('/').pop()
                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                            return (
                                                <div key={index}>
                                                    <span
                                                        className='btn btn-link p-0'
                                                        style={{ textDecoration: 'underline' }}
                                                        onClick={() => downloadFile(fileUrl, fileName)}
                                                    >
                                                        {originalName}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}

            {showPostModal && selectedPost && (
                <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-lg modal-dialog-scrollable'>
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
                                                            style={{ textDecoration: 'underline'}}
                                                            onClick={() => downloadFile(fileUrl, fileName)}
                                                        >
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
                                        <h5>Submit Your Report</h5>
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
                                        <button className='btn btn-success' onClick={handleSubmitReport}>Submit</button>
                                        {submissions && getMySubmission() && (
                                            <div className='mt-3'>
                                                <h6>Your Submissions:</h6>
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
                                        <table className='table'>
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Status</th>
                                                    <th>Report</th>
                                                    <th>Files</th>
                                                    <th>Grade</th>
                                                    <th>Note</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submissions.map(sub => (
                                                    <tr key={sub.id}>
                                                        <td>{sub.author || sub.id}</td>
                                                        <td>{sub.submittedAt ? 'Turned In' : 'Not Turned In'}</td>
                                                        <td>{sub.content}</td>
                                                        <td>
                                                            {sub.fileUrls && sub.fileUrls.length > 0 && (
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
                                                                                    {originalName}
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{sub.grade || '-'}</td>
                                                        <td>{sub.teacherNote || '-'}</td>
                                                        <td>
                                                            <GradeForm
                                                                initialGrade={sub.grade}
                                                                initialNote={sub.teacherNote}
                                                                onSave={(grade, note) => handleGrade(sub.id, grade, note)}
                                                            >
                                                            </GradeForm>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={closePostModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WeeklyReportPage