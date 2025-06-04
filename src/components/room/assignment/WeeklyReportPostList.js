import React from 'react'
import { downloadFile } from '../../../services/download-service'

function WeeklyReportPostList({ posts, mySubmissions, currentUser, editingPostId, editingPostTitle, setEditingPostTitle, editingPostContent, setEditingPostContent, editingPostDeadline, setEditingPostDeadline, selectedEditFiles, setSelectedEditFiles, filesToDelete, setFilesToDelete, editFileInputRef, handleSelectPost, handleEditPost, handleDeletePost, handleRemoveFile, handleSaveEditPost, setEditingPostId }) {
    return (
        <>
            {posts.length === 0 ? (
                <p>No assignments</p>
            ) : (
                posts.map((post) => {
                    const mySub = mySubmissions && mySubmissions.find(sub => sub.reportPostId === post.id)
                    return (
                        <div key={post.id} className='card mb-3'>
                            <div className='card-body'>
                                <div className='d-flex justify-content-between align-items-center'>
                                    <h4 className='card-title' style={{ fontWeight: 'bold' }}>{post.title}</h4>
                                    <div className='d-flex align-item-center'>
                                        <span
                                            className='btn btn-link p-0 me-2'
                                            title='View'
                                            onClick={() => handleSelectPost(post)}
                                            style={{ color: '#1976d2' }}
                                        >
                                            <i className='bi bi-eye fs-3'></i>
                                        </span>
                                        {currentUser.role === 'TEACHER' && post.author === currentUser.username && (
                                            <>
                                                <span
                                                    className='btn btn-link p-0 me-2'
                                                    title='Edit'
                                                    style={{ color: '#ffc107' }}
                                                    onClick={() => handleEditPost(post)}
                                                >
                                                    <i className='bi bi-pencil-square fs-3'></i>
                                                </span>
                                                <span
                                                    className='btn btn-link p-0 me-2'
                                                    title='Delete'
                                                    style={{ color: '#dc3545' }}
                                                    onClick={() => handleDeletePost(post.id)}
                                                >
                                                    <i className='bi bi-trash-fill fs-3'></i>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className='text-muted small'>
                                    Deadline: {new Date(post.deadline).toLocaleString()}
                                </p>
                                {currentUser.role === 'STUDENT' && (
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        {mySub ?
                                            <>
                                                <span className='text-success'>Submitted </span>
                                                {mySub.isLate && <span className='badge bg-danger ms-2'>Late</span>}
                                                <span>{new Date(mySub.submittedAt).toLocaleString()}</span>
                                                {mySub.late
                                                    ? <span className='badge bg-danger ms-2'>Late</span>
                                                    : <span className='badge bg-success ms-2'>On Time</span>
                                                }
                                            </>
                                            : <span className='text-danger'>Not Submitted</span>
                                        }
                                    </p>
                                )}
                                {editingPostId === post.id ? (
                                    <div>
                                        <label className='form-label fw-semibold'>Title</label>
                                        <input
                                            className='form-control mb-2'
                                            placeholder='Edit title...'
                                            value={editingPostTitle}
                                            onChange={e => setEditingPostTitle(e.target.value)}
                                        >
                                        </input>
                                        <div className='position-relative'>
                                            <label className='form-label fw-semibold'>Description</label>
                                            <textarea
                                                className='form-control mb-2'
                                                placeholder='Edit content...'
                                                value={editingPostContent}
                                                onChange={e => setEditingPostContent(e.target.value)}
                                            >
                                            </textarea>
                                            <button
                                                type='button'
                                                className='attach-btn-inside-textarea'
                                                onClick={() => editFileInputRef.current && editFileInputRef.current.click()}
                                                tabIndex={-1}
                                            >
                                                <i className='bi bi-paperclip fs-4' style={{ color: 'var(--main-red)' }}></i>
                                            </button>
                                            <input
                                                type='file'
                                                className='d-none'
                                                multiple
                                                ref={editFileInputRef}
                                                onChange={e => setSelectedEditFiles(Array.from(e.target.files))}
                                            >
                                            </input>
                                        </div>
                                        <div className='position-relative mt-2'>
                                            <label className='form-label fw-semibold'>Deadline</label>
                                            <input
                                                className='form-control mb-2'
                                                type='datetime-local'
                                                value={editingPostDeadline}
                                                onChange={e => setEditingPostDeadline(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <strong>Current Attachments: </strong>
                                            <div>
                                                {post.fileUrls && post.fileUrls.length > 0
                                                    ? post.fileUrls
                                                        .filter(fileUrl => !filesToDelete.includes(fileUrl))
                                                        .map((fileUrl, index) => {
                                                            const fileName = fileUrl.split('/').pop()
                                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                            return (
                                                                <span key={index} className='me-2'>
                                                                    <span
                                                                        className='btn btn-link p-0'
                                                                        style={{ textDecoration: 'underline' }}
                                                                        onClick={() => downloadFile(fileUrl, fileName)}
                                                                    >
                                                                        <i className='bi bi-paperclip me-1'></i>
                                                                        {originalName}
                                                                    </span>
                                                                    <span
                                                                        className='btn btn-sm ms-1'
                                                                        onClick={() => handleRemoveFile(fileUrl)}
                                                                        style={{ cursor: 'pointer' }}
                                                                        title='Delete'
                                                                    >
                                                                        <i className='bi bi-x-lg'></i>
                                                                    </span>
                                                                </span>
                                                            )
                                                        })
                                                    : <span className='text-muted'>No attachments</span>
                                                }
                                            </div>
                                        </div>
                                        {selectedEditFiles && selectedEditFiles.length > 0 && (
                                            <div className='mt-2'>
                                                {selectedEditFiles.map((file, index) => (
                                                    <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            className='btn btn-sm btn-success me-2 mt-2'
                                            onClick={handleSaveEditPost}
                                        >
                                            <i className='bi bi-check-lg me-1'></i>
                                            Save
                                        </button>
                                        <button
                                            className='btn btn-sm btn-secondary mt-2'
                                            onClick={() => setEditingPostId(null)}
                                        >
                                            <i className='bi bi-x-lg me-1'></i>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
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
                                                                    <i className='bi bi-paperclip me-1'></i>
                                                                    {originalName}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </>
    )
}

export default WeeklyReportPostList