import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPoll, editPoll, getPolls, getPollVotes, votePoll, deletePoll } from '../../../services/poll-service'
import { downloadFile } from '../../../services/download-service'

function Voting({ roomId, currentUser, room }) {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [pollTitle, setPollTitle] = useState('')
    const [pollDescription, setPollDescription] = useState('')
    const [pollFiles, setPollFiles] = useState([])
    const [options, setOptions] = useState(['', ''])
    const [deadline, setDeadline] = useState('')
    const [polls, setPolls] = useState([])
    const [votes, setVotes] = useState({})
    const [submittingVote, setSubmittingVote] = useState(null)
    const fileInputRef = useRef(null)

    const [editingPollId, setEditingPollId] = useState(null)
    const [editingPollTitle, setEditingPollTitle] = useState('')
    const [editingPollDescription, setEditingPollDescription] = useState('')
    const [editingPollDeadline, setEditingPollDeadline] = useState('')
    const [editingPollOptions, setEditingPollOptions] = useState(['', ''])
    const [editingPollFiles, setEditingPollFiles] = useState([])
    const [editingFilesToDelete, setEditingFilesToDelete] = useState([])
    const editingFileInputRef = useRef(null)

    const fetchPolls = useCallback(async () => {
        try {
            const response = await getPolls(roomId)
            setPolls(response.data.polls)
            const allVotes = {}
            for (const poll of (response.data.polls)) {
                try {
                    const voteRes = await getPollVotes(roomId, poll.id)
                    allVotes[poll.id] = voteRes.data.votes
                } catch {
                    allVotes[poll.id] = []
                }
            }
            setVotes(allVotes)
        } catch (error) {
            setPolls([])
        }
    }, [roomId])

    useEffect(() => {
        fetchPolls()
    }, [roomId, fetchPolls])

    const handleOptionChange = (index, value) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    const handleAddOption = () => {
        setOptions([...options, ''])
    }

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index))
        }
    }

    const handleCreatePoll = async () => {
        if (!pollTitle.trim() || options.filter(option => option.trim() !== '').length < 2 || !deadline) {
            return
        }
        try {
            await createPoll(roomId, pollTitle, pollDescription, options.filter(option => option.trim() !== ''), deadline, pollFiles)
            setShowCreateModal(false)
            setPollTitle('')
            setPollDescription('')
            setPollFiles([])
            setOptions(['', ''])
            setDeadline('')
            if (fileInputRef.current) fileInputRef.current.value = ''
            fetchPolls()
        } catch (error) {
            console.error(error)
        }
    }

    const handleEditPoll = (poll) => {
        setEditingPollId(poll.id)
        setEditingPollTitle(poll.title)
        setEditingPollDescription(poll.description)
        setEditingPollDeadline(poll.deadline ? poll.deadline.slice(0, 16) : '')
        setEditingPollOptions([...poll.options])
        setEditingPollFiles([])
        setEditingFilesToDelete([])
        if (editingFileInputRef.current) editingFileInputRef.current.value = ''
    }

    const handleEditOptionChange = (index, value) => {
        const newOptions = [...editingPollOptions]
        newOptions[index] = value
        setEditingPollOptions(newOptions)
    }

    const handleAddEditOption = () => {
        setEditingPollOptions([...editingPollOptions, ''])
    }

    const handleMarkEditFileToDelete = (fileUrl) => {
        setEditingFilesToDelete(prev => [...prev, fileUrl])
    }
    const handleSaveEditPoll = async () => {
        if (!editingPollTitle.trim() || editingPollOptions.filter(option => option.trim() !== '').length < 2 || !editingPollDeadline) {
            return
        }
        try {
            await editPoll(roomId, editingPollId, editingPollTitle, editingPollDescription, editingPollOptions.filter(option => option.trim() !== ''), editingPollDeadline, editingPollFiles, editingFilesToDelete)
            setEditingPollId(null)
            setEditingPollTitle('')
            setEditingPollDescription('')
            setEditingPollDeadline('')
            setEditingPollOptions(['', ''])
            setEditingPollFiles([])
            setEditingFilesToDelete([])
            if (editingFileInputRef.current) editingFileInputRef.current.value = ''
            fetchPolls()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeletePoll = async (pollId) => {
        if (!window.confirm('Are you sure you want to delete this poll?')) return
        try {
            await deletePoll(roomId, pollId)
            fetchPolls()
        } catch (error) {
            console.error(error)
        }
    }

    const handleVote = async (pollId, optionIndex) => {
        setSubmittingVote(pollId)
        try {
            await votePoll(roomId, pollId, optionIndex)
            fetchPolls()
        } catch (error) {
            console.error('Failed to vote.')
        }
        setSubmittingVote(null)
    }

    const getUserVote = (pollId) => {
        const pollVotes = votes[pollId] || []
        const found = pollVotes.find(v => v.username === currentUser.username)
        return found ? found.optionIndex : null
    }

    const getOptionVoteCount = (pollId, optionIndex) => {
        const pollVotes = votes[pollId] || []
        return pollVotes.filter(v => v.optionIndex === optionIndex).length
    }

    return (
        <div className='mt-4'>
            <div className='d-flex justify-content-between align-items-center mb-3'>
                <h3 className='fw-bold mb-0'>Voting</h3>
                <button className='btn btn-primary' onClick={() => setShowCreateModal(true)}>
                    <i className='bi bi-plus-circle me-2'></i>
                    Create Poll
                </button>
            </div>

            {/* Polls as Cards */}
            <div>
                {polls.length === 0 ? (
                    <div className='text-muted text-center'>No polls yet.</div>
                ) : (
                    polls.map((poll) => {
                        const userVote = getUserVote(poll.id)
                        const isClosed = poll.deadline && new Date(poll.deadline) < new Date()
                        return (
                            <div key={poll.id} className='card mb-3'>
                                <div className='card-body'>
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <h4 className='card-title fw-bold'>{poll.title}</h4>
                                        {currentUser && (poll.createdBy === currentUser.username) && (
                                            <div>
                                                <span
                                                    className='btn btn-link p-0 me-2'
                                                    title='Edit'
                                                    style={{ color: '#ffc107' }}
                                                    onClick={() => handleEditPoll(poll)}
                                                >
                                                    <i className='bi bi-pencil-square fs-4'></i>
                                                </span>
                                                <span
                                                    className='btn btn-link p-0 me-2'
                                                    title='Delete'
                                                    style={{ color: '#dc3545' }}
                                                    onClick={() => handleDeletePoll(poll.id)}
                                                >
                                                    <i className='bi bi-trash-fill fs-4'></i>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {editingPollId === poll.id ? (
                                        <div>
                                            <label className='form-label fw-semibold'>Title</label>
                                            <input
                                                className='form-control mb-2'
                                                placeholder='Edit title...'
                                                value={editingPollTitle}
                                                onChange={e => setEditingPollTitle(e.target.value)}
                                            >
                                            </input>
                                            <div className='position-relative'>
                                                <label className='form-label fw-semibold'>Description</label>
                                                <textarea
                                                    className='form-control mb-2'
                                                    placeholder='Edit description...'
                                                    value={editingPollDescription}
                                                    onChange={e => setEditingPollDescription(e.target.value)}
                                                />
                                            </div>
                                            <div className='position-relative'>
                                                <label className='form-label fw-semibold'>Deadline</label>
                                                <input
                                                    className='form-control mb-2'
                                                    type='datetime-local'
                                                    value={editingPollDeadline}
                                                    onChange={e => setEditingPollDeadline(e.target.value)}
                                                />
                                            </div>
                                            <div className='mb-2'>
                                                <strong>Current Attachments:</strong>
                                                <div>
                                                    {poll.fileUrls && poll.fileUrls.length > 0
                                                        ? poll.fileUrls
                                                            .filter(fileUrl => !editingFilesToDelete.includes(fileUrl))
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
                                                                            onClick={() => handleMarkEditFileToDelete(fileUrl)}
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
                                                <input
                                                    type='file'
                                                    className='form-control mt-2'
                                                    multiple
                                                    ref={editingFileInputRef}
                                                    onChange={e => setEditingPollFiles(Array.from(e.target.files))}
                                                />
                                                {editingPollFiles.length > 0 && (
                                                    <div className='mt-2'>
                                                        {editingPollFiles.map((file, index) => (
                                                            <span key={index} className='badge bg-secondary me-2'>
                                                                {file.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className='mb-2 mt-2'>
                                                <label className='form-label fw-semibold'>Voting Options</label>
                                                {editingPollOptions.map((option, index) => (
                                                    <div className='input-group mb-2' key={index}>
                                                        <input
                                                            className='form-control'
                                                            placeholder={`Option ${index + 1}`}
                                                            value={option}
                                                            onChange={e => handleEditOptionChange(index, e.target.value)}
                                                            required
                                                        />
                                                        {editingPollOptions.length > 2 && (
                                                            <button
                                                                className='btn btn-outline-danger'
                                                                type='button'
                                                                onClick={() => setEditingPollOptions(editingPollOptions.filter((_, i) => i !== index))}
                                                            >
                                                                <i className='bi bi-x'></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button className='btn btn-outline-secondary btn-sm' type='button' onClick={handleAddEditOption}>
                                                    <i className='bi bi-plus-lg me-1'></i>
                                                    Add Option
                                                </button>
                                            </div>
                                            <button
                                                className='btn btn-sm btn-success me-2 mt-2'
                                                onClick={handleSaveEditPoll}
                                            >
                                                <i className='bi bi-check-lg me-1'></i>
                                                Save
                                            </button>
                                            <button
                                                className='btn btn-sm btn-secondary mt-2'
                                                onClick={() => setEditingPollId(null)}
                                            >
                                                <i className='bi bi-x-lg me-1'></i>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='text-muted small mb-1'>
                                                Deadline: {poll.deadline ? new Date(poll.deadline).toLocaleString() : '-'}
                                            </p>
                                            {poll.description && (
                                                <div className='mb-2 mt-2'>
                                                    <div>{poll.description}</div>
                                                </div>
                                            )}
                                            <div className='mb-2'>
                                                <strong>Attachments:</strong>
                                                <div>
                                                    {poll.fileUrls && poll.fileUrls.length > 0
                                                        ? poll.fileUrls.map((fileUrl, index) => {
                                                            const fileName = fileUrl.split('/').pop()
                                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                                            return (
                                                                <span
                                                                    key={index}
                                                                    className='btn btn-link p-0 me-2'
                                                                    style={{ textDecoration: 'underline' }}
                                                                    onClick={() => downloadFile(fileUrl, fileName)}
                                                                >
                                                                    <i className='bi bi-paperclip me-1'></i>
                                                                    {originalName}
                                                                </span>
                                                            )
                                                        })
                                                        : <span className='text-muted ms-2'>No attachments</span>
                                                    }
                                                </div>
                                            </div>
                                            <div className='mb-2'>
                                                <strong>Options:</strong>
                                                <ul className='mb-0 ps-3'>
                                                    {poll.options.map((option, index) => (
                                                        <li key={index}>
                                                            <div className='d-flex align-items-center'>
                                                                <button
                                                                    className={`btn btn-sm me-2 ${userVote === index ? 'btn-success' : 'btn-outline-primary'}`}
                                                                    disabled={isClosed || submittingVote === poll.id}
                                                                    onClick={() => handleVote(poll.id, index)}
                                                                >
                                                                    {userVote === index ? <i className='bi bi-check-circle-fill'></i> : <i className='bi bi-circle'></i>}
                                                                </button>
                                                                <span>{option}</span>
                                                                <span className='ms-auto badge bg-light text-dark border ms-2'>
                                                                    {getOptionVoteCount(poll.id, index)} vote{getOptionVoteCount(poll.id, index) !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {userVote !== null && !isClosed && (
                                                    <div className='text-success mt-2'>
                                                        <i className='bi bi-check-circle me-1'></i>
                                                        You voted: <strong>{poll.options[userVote]}</strong>
                                                    </div>
                                                )}
                                                {isClosed && (
                                                    <div className='text-danger mt-2'>
                                                        <i className='bi bi-lock me-1'></i>
                                                        Poll closed.
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Create Poll Modal */}
            {showCreateModal && (
                <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-lg'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>
                                    <i className='bi bi-bar-chart-steps me-2'></i>
                                    Create a Poll
                                </h5>
                                <button type='button' className='btn-close' onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className='modal-body'>
                                <label className='form-label fw-semibold'>Title</label>
                                <input
                                    className='form-control mb-2'
                                    placeholder='Poll title...'
                                    value={pollTitle}
                                    onChange={e => setPollTitle(e.target.value)}
                                    required
                                />
                                <div className='position-relative'>
                                    <label className='form-label fw-semibold'>Description</label>
                                    <textarea
                                        className='form-control'
                                        placeholder='Describe the poll...'
                                        value={pollDescription}
                                        onChange={e => setPollDescription(e.target.value)}
                                        style={{ paddingRight: 40 }}
                                    />
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
                                        onChange={e => setPollFiles(Array.from(e.target.files))}
                                    />
                                </div>
                                {pollFiles.length > 0 && (
                                    <div className='mt-2'>
                                        {pollFiles.map((file, index) => (
                                            <span key={index} className='badge bg-secondary me-2'>
                                                {file.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className='position-relative mt-2'>
                                    <label className='form-label fw-semibold'>Deadline</label>
                                    <input
                                        className='form-control'
                                        type='datetime-local'
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='mb-2 mt-2'>
                                    <label className='form-label fw-semibold'>Voting Options</label>
                                    {options.map((option, index) => (
                                        <div className='input-group mb-2' key={index}>
                                            <input
                                                className='form-control'
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={e => handleOptionChange(index, e.target.value)}
                                                required
                                            />
                                            {options.length > 2 && (
                                                <button
                                                    className='btn btn-outline-danger'
                                                    type='button'
                                                    onClick={() => handleRemoveOption(index)}
                                                >
                                                    <i className='bi bi-x'></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button className='btn btn-outline-secondary btn-sm' type='button' onClick={handleAddOption}>
                                        <i className='bi bi-plus-lg me-1'></i>
                                        Add Option
                                    </button>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={() => setShowCreateModal(false)}>
                                    <i className='bi bi-x-lg me-1'></i>
                                    Cancel
                                </button>
                                <button
                                    className='btn btn-primary'
                                    onClick={handleCreatePoll}
                                    disabled={
                                        !pollTitle.trim() ||
                                        options.filter(option => option.trim() !== '').length < 2 ||
                                        !deadline
                                    }
                                >
                                    <i className='bi bi-send me-1'></i>
                                    Create Poll
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Voting