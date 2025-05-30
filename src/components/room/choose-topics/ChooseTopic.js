import React, { useEffect, useRef, useState } from 'react'
import { getAllTopics, getStudentSelectedTopic, selectExistingTopic, submitCustomTopic } from '../../../services/topic-service'
import { downloadFile } from '../../../services/download-service'

function ChooseTopics({ roomId, currentUser }) {
    const [topics, setTopics] = useState([])
    const [customTitle, setCustomTitle] = useState('')
    const [customDescription, setCustomDescription] = useState('')
    const [customFiles, setCustomFiles] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const fileInputRef = useRef(null)
    const [studentSelection, setStudentSelection] = useState(null)
    const [selectedTopic, setSelectedTopic] = useState(null)



    const fetchTopics = async () => {
        try {

            const response = await getAllTopics(roomId)
            setTopics(response.data.topics)
        } catch (error) {
            console.error('Failed to load topics')
        }
    }

    const fetchStudentSelection = async () => {
        try {
            const response = await getStudentSelectedTopic(roomId)
            setStudentSelection(response.data)
            setSubmitted(true)
            setSelectedTopic(response.data.topic)
        } catch (error) {
            console.error(error)
            setStudentSelection(null)
            setSubmitted(false)
            setSelectedTopic(null)
        }
    }

    useEffect(() => {
        fetchTopics()
        fetchStudentSelection()
    }, [roomId])

    const handleDropdownChange = (e) => {
        const topic = topics.find(t => t.id === e.target.value)
        setSelectedTopic(topic || null)
    }

    const handleSelectTopic = (topicId) => {
        const topic = topics.find(t => t.id === topicId)
        setSelectedTopic(topic)
        setShowModal(true)
    }

    const handleChooseExisting = async () => {
        try {
            await selectExistingTopic(roomId, selectedTopic.id)
            setSubmitted(true)
            setShowModal(false)
            fetchStudentSelection()
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmitCustom = async () => {
        if (!customTitle.trim() || !customDescription.trim()) {
            return
        }
        try {
            await submitCustomTopic(roomId, customTitle, customDescription, customFiles)
            console.log(customTitle)
            console.log(customDescription)
            console.log(customFiles)
            setSubmitted(true)
            setCustomTitle('')
            setCustomDescription('')
            setCustomFiles([])
            setShowCreateModal(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            fetchStudentSelection()
        } catch (error) {
            console.error(error)
        }
    }

    const handleReselect = () => {
        setSubmitted(false)
        setSelectedTopic(null)
    }

    return (
        <div className='container mt-4'>
            <h3 className="mb-4">Topic Selection</h3>
            <div className='mb-4'>
                {studentSelection && studentSelection.topic ? (
                    <div className="card border-black shadow-sm">
                        <div className='card-header d-flex text-white justify-content-between align-items-center' style={{background: 'var(--main-red)'}}>
                            <span>
                                <i className="bi bi-check-circle me-2"></i>
                                Your Selected Topic
                            </span>
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={handleReselect}
                                title="Choose a different topic"
                            >
                                Reselect Topic
                            </button>
                        </div>
                        <div className='card-body'>
                            <h5 className="card-title">{studentSelection.topic.title}</h5>
                            <div className="card-text-mb-2"><strong>Description:</strong> {studentSelection.topic.description}</div>
                            {studentSelection.topic.fileUrls && studentSelection.topic.fileUrls.length > 0 && (
                                <div className='mb-2'>
                                    <strong>Attachments:</strong>
                                    <div>
                                        {studentSelection.topic.fileUrls.map((fileUrl, index) => {
                                            const fileName = fileUrl.split('/').pop()
                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                            return (
                                                <span
                                                    key={index}
                                                    className="btn btn-link p-0 ms-2"
                                                    title={originalName}
                                                    onClick={() => downloadFile(fileUrl, originalName)}
                                                >
                                                    <i className="bi bi-paperclip me-1"></i>
                                                    {originalName}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <span className="badge bg-secondary">{studentSelection.isCustom ? 'Custom Topic' : 'Existing Topic'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-secondary text-center mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        You have not selected a topic yet.
                    </div>
                )}
            </div>
            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Choose an Existing Topic</h5>
                </div>
                <div className='card-body'>
                    <select
                        className='form-select mb-3'
                        value={selectedTopic ? selectedTopic.id : ''}
                        onChange={handleDropdownChange}
                        disabled={submitted}
                    >
                        <option value=''>-- Select a topic --</option>
                        {topics.map(topic => (
                            <option key={topic.id} value={topic.id}>
                                {topic.title}
                            </option>
                        ))}
                    </select>
                    {selectedTopic && (
                        <div className='mt-2'>
                            <div><strong>Description:</strong> {selectedTopic.description}</div>
                            {selectedTopic.fileUrls && selectedTopic.fileUrls.length > 0 && (
                                <div>
                                    <strong>Attachments: </strong>
                                    <div>
                                        {selectedTopic.fileUrls.map((fileUrl, index) => {
                                            const fileName = fileUrl.split('/').pop()
                                            const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                            return (
                                                <span
                                                    key={index}
                                                    className='btn btn-link p-0 ms-2'
                                                    onClick={() => downloadFile(fileUrl, fileName)}
                                                >
                                                    <i className='bi bi-paperclip me-1'></i>
                                                    {originalName}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <button
                                className='btn btn-outline-primary btn-sm mt-3'
                                onClick={() => handleSelectTopic(selectedTopic.id)}
                                disabled={submitted}
                            >
                                {submitted && studentSelection && selectedTopic.id === studentSelection.topic.id ? 'Selected' : 'Select'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for confirming topic selection */}
            {showModal && selectedTopic && (
                <div className='modal d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Confirm Topic Selection</h5>
                                <button type='button' className='btn-close' onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className='modal-body'>
                                <p>Are you sure you want to select the topic:</p>
                                <strong>{selectedTopic.title}</strong>
                                <div className='text-muted'>{selectedTopic.description}</div>
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-secondary' onClick={() => setShowModal(false)}>Cancel</button>
                                <button className='btn btn-primary' onClick={handleChooseExisting}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <hr />

            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Or Submit Your Own Topic</h5>
                </div>
                <div className="card-body">
                    <button className='btn btn-success mb-3' onClick={() => setShowCreateModal(true)}>
                        Create Custom Topic
                    </button>
                </div>
            </div>

            {/* Modal for creating custom topic */}
            {showCreateModal && (
                <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-lg'>
                        <div className='modal-content '>
                            <div className='modal-header'>
                                <h5 className='modal-title'>
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Submit Custom Topic
                                </h5>
                                <button type='button' className='btn-close' onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className='modal-body'>
                                <div className='mb-2'>
                                    <label className='form-label fw-semibold'>Title</label>
                                    <input
                                        type='text'
                                        className='form-control mb-2'
                                        placeholder='Add a title...'
                                        value={customTitle}
                                        onChange={e => setCustomTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='position-relative'>
                                    <div className='mb-2'>
                                        <label className='form-label fw-semibold'>Description</label>
                                        <textarea
                                            className='form-control'
                                            placeholder='Describe your topic suggestion...'
                                            value={customDescription}
                                            style={{ paddingRight: 40 }}
                                            onChange={e => setCustomDescription(e.target.value)}
                                            required
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
                                            onChange={e => setCustomFiles(Array.from(e.target.files))}
                                        />
                                    </div>
                                </div>
                                {customFiles.length > 0 && (
                                    <div className='mb-2'>
                                        {customFiles.map((file, idx) => (
                                            <span key={idx} className='badge bg-secondary me-2'>{file.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className='modal-footer'>
                                <button 
                                    className='btn btn-secondary' 
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <i className='bi bi-x-lg me-1'></i>
                                    Cancel
                                </button>
                                <button 
                                    className='btn btn-primary' 
                                    onClick={handleSubmitCustom} 
                                    disabled={submitted}
                                >
                                    <i className='bi bi-send me-1'></i>
                                    Submit Custom Topic
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChooseTopics